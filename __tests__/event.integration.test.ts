import request from "supertest";
import app from "../src/app";
import { AppDataSource } from "../src/data-source";

describe("Event Ticket Booking API Integration Tests", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("Concurrent Booking", () => {
    let eventId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/initialize")
        .send({ name: "Test Event", totalTickets: 3 });
      eventId = response.body.data.id;
    });

    it("should confirm only up to available tickets and waitlist the rest", async () => {
      // Simulate 10 concurrent booking requests
      const bookingRequests = Array.from({ length: 10 }).map((_, index) =>
        request(app)
          .post("/api/book")
          .send({ eventId, user: `user${index}@example.com` })
      );

      const responses = await Promise.all(bookingRequests);

      // Count the number of confirmed and waitlisted bookings based on the response
      const confirmedCount = responses.filter(
        (res) => res.body.data && res.body.data.status === "confirmed"
      ).length;
      const waitlistCount = responses.filter(
        (res) => res.body.data && res.body.data.status === "waitlist"
      ).length;

      expect(confirmedCount).toBe(3); 
      expect(waitlistCount).toBe(7);

      const statusResponse = await request(app).get(`/api/status/${eventId}`);
      expect(statusResponse.body.data.availableTickets).toBe(0);
      expect(statusResponse.body.data.waitingListCount).toBe(7);
    });
  });

  describe("Concurrent Cancellation and Booking", () => {
    let eventId: string;
    let confirmedBookingId: string;

    beforeEach(async () => {
      const initResponse = await request(app)
        .post("/api/initialize")
        .send({ name: "Cancel Test Event", totalTickets: 1 });
      eventId = initResponse.body.data.id;

      const confirmedResponse = await request(app)
        .post("/api/book")
        .send({ eventId, user: "confirmed@example.com" });
      confirmedBookingId = confirmedResponse.body.data.id;

      // Add two waitlist bookings
      await Promise.all([
        request(app)
          .post("/api/book")
          .send({ eventId, user: "wait1@example.com" }),
        request(app)
          .post("/api/book")
          .send({ eventId, user: "wait2@example.com" }),
      ]);
    });

    it("should reassign waiting booking on concurrent cancellation and new booking", async () => {
      // Simulate cancellation of the confirmed booking and a new booking concurrently
      const cancelPromise = request(app)
        .post("/api/cancel")
        .send({ bookingId: confirmedBookingId });
      const newBookingPromise = request(app)
        .post("/api/book")
        .send({ eventId, user: "newuser@example.com" });

      const [cancelRes, _] = await Promise.all([
        cancelPromise,
        newBookingPromise,
      ]);

      expect(cancelRes.status).toBe(200);
      // Depending on the order of execution, the new booking may be confirmed or waitlisted.
      // We then check the overall status.
      const statusResponse = await request(app).get(`/api/status/${eventId}`);
      const { availableTickets, waitingListCount } = statusResponse.body.data;

      // With one ticket originally and one cancellation that reassigns a waiting booking,
      // availableTickets should be 0, and at least one booking should now be confirmed.
      expect(availableTickets).toBe(0);
      // waitingListCount might be 1 or 2 depending on the race outcome, but should be >= 1.
      expect(waitingListCount).toBeGreaterThanOrEqual(1);
    });
  });
});
