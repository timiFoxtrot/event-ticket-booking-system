import { EventService } from "../src/services/event.service";
import { Event } from "../src/entities/Event";
import { Booking, BookingStatus } from "../src/entities/Booking";

const mockEventRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockBookingRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
};

jest.mock("../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === Event) return mockEventRepository;
      if (entity === Booking) return mockBookingRepository;
    }),
    manager: {
      transaction: jest.fn().mockImplementation(async (cb: any) => {
        return await cb({
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Booking) return mockBookingRepository;
            if (entity === Event) return mockEventRepository;
          }),
        });
      }),
    },
  },
}));

describe("EventService Unit Tests", () => {
  let eventService: EventService;

  beforeEach(() => {
    eventService = new EventService();
    jest.clearAllMocks();
  });

  describe("initializeEvent", () => {
    it("should create an event with given name and totalTickets", async () => {
      const eventToSave = {
        name: "Test Event",
        total_tickets: 5,
        available_tickets: 5,
      };
      mockEventRepository.save.mockResolvedValue({ ...eventToSave, id: "123" });

      const result = await eventService.initializeEvent("Test Event", 5);

      expect(mockEventRepository.save).toHaveBeenCalledWith(eventToSave);
      expect(result).toEqual({ ...eventToSave, id: "123" });
    });
  });

  describe("bookTicket", () => {
    it("should confirm a booking if tickets are available", async () => {
      // Arrange: available_tickets > 0
      const event = { id: "e1", available_tickets: 2 };
      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.create.mockImplementation((data) => data);
      mockBookingRepository.save.mockImplementation((booking) =>
        Promise.resolve({ ...booking, id: "b1" })
      );
      mockEventRepository.save.mockImplementation((evt) =>
        Promise.resolve(evt)
      );

      // Act
      const booking = await eventService.bookTicket("e1", "user@example.com");

      // Assert
      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: "e1" },
        lock: { mode: "pessimistic_write" },
      });
      expect(event.available_tickets).toBe(1); // Reduced by one
      expect(booking.status).toBe(BookingStatus.CONFIRMED);
      expect(booking.user).toBe("user@example.com");
    });

    it("should add to waiting list if no tickets are available", async () => {
      // Arrange: available_tickets === 0
      const event = { id: "e1", available_tickets: 0 };
      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.create.mockImplementation((data) => data);
      mockBookingRepository.save.mockImplementation((booking) =>
        Promise.resolve({ ...booking, id: "b2" })
      );

      // Act
      const booking = await eventService.bookTicket("e1", "user2@example.com");

      // Assert
      expect(booking.status).toBe(BookingStatus.WAITLIST);
    });
  });

  describe("calcelBooking", () => {
    it("should cancel a confirmed booking and reassign a waiting booking if available", async () => {
      // Arrange:
      // Setup a booking that is confirmed and belongs to an event.
      const event = { id: "event1", available_tickets: 0 };
      const confirmedBooking = {
        id: "booking1",
        status: BookingStatus.CONFIRMED,
        event: { id: event.id },
      };
      const waitingBooking = {
        id: "booking2",
        status: BookingStatus.WAITLIST,
        event: { id: event.id },
      };

      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.findOne
        .mockResolvedValueOnce(confirmedBooking)
        .mockResolvedValueOnce(waitingBooking);

      mockBookingRepository.save.mockImplementation(async (booking) => booking);
      mockEventRepository.save.mockImplementation(async (evt) => evt);

      // Act:
      await eventService.cancelBooking("booking1");

      // Assert:
      expect(mockBookingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "booking1",
          status: BookingStatus.CANCELLED,
        })
      );
      
      expect(mockEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: "event1", available_tickets: 0 })
      );
      // Confirm that the waiting booking was updated to confirmed.
      expect(mockBookingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "booking2",
          status: BookingStatus.CONFIRMED,
        })
      );
    });

    it("should throw an error if booking is not found", async () => {
      // Arrange: findOne returns null for booking.
      mockBookingRepository.findOne.mockResolvedValueOnce(null);

      // Act & Assert:
      await expect(eventService.cancelBooking("nonexistent")).rejects.toThrow(
        "Booking not found"
      );
    });
  });

  it("should return available tickets and waiting list count", async () => {
    // Arrange:
    const event = { id: "event1", available_tickets: 2 };
    mockEventRepository.findOne.mockResolvedValueOnce(event);
    // When counting waitlist, return 3.
    mockBookingRepository.count.mockResolvedValueOnce(3);

    // Act:
    const status = await eventService.getEventStatus("event1");

    // Assert:
    expect(mockEventRepository.findOne).toHaveBeenCalledWith({
      where: { id: "event1" },
    });
    expect(mockBookingRepository.count).toHaveBeenCalledWith({
      where: { event: { id: "event1" }, status: BookingStatus.WAITLIST },
    });
    expect(status).toEqual({ availableTickets: 2, waitingListCount: 3 });
  });

  it("should throw an error if event is not found", async () => {
    // Arrange:
    mockEventRepository.findOne.mockResolvedValueOnce(null);

    // Act & Assert:
    await expect(eventService.getEventStatus("nonexistent")).rejects.toThrow("Event not found");
  });
});
