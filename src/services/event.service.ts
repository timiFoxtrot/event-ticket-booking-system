import { Service } from "typedi";
import { Event } from "../entities/Event";
import { Booking, BookingStatus } from "../entities/Booking";
import { AppDataSource } from "../data-source";

@Service()
export class EventService {
  async initializeEvent(name: string, totalTickets: number): Promise<Event> {
    const eventRepository = AppDataSource.getRepository(Event);
    const event = new Event();
    event.name = name;
    event.total_tickets = totalTickets;
    event.available_tickets = totalTickets;
    return await eventRepository.save(event);
  }

  async bookTicket(eventId: string, user: string): Promise<Booking> {
    return await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const eventRepository = transactionalEntityManager.getRepository(Event);
        const bookingRepository =
          transactionalEntityManager.getRepository(Booking);

        const event = await eventRepository.findOne({
          where: { id: eventId },
          lock: { mode: "pessimistic_write" },
        });
        if (!event) {
          throw new Error("Event not found");
        }

        let booking: Booking;
        if (event.available_tickets > 0) {
          // Confirmed booking: reduce availableTickets
          event.available_tickets -= 1;
          await eventRepository.save(event);
          booking = bookingRepository.create({
            user,
            status: BookingStatus.CONFIRMED,
            event,
          });
        } else {
          // Sold out: add to waiting list
          booking = bookingRepository.create({
            user,
            status: BookingStatus.WAITLIST,
            event,
          });
        }
        return await bookingRepository.save(booking);
      }
    );
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const bookingRepository =
          transactionalEntityManager.getRepository(Booking);
        const eventRepository = transactionalEntityManager.getRepository(Event);

        const booking = await bookingRepository.findOne({
          where: { id: bookingId },
          relations: ["event"],
        });
        if (!booking) {
          throw new Error("Booking not found");
        }
        if (booking.status === BookingStatus.CANCELLED) {
          throw new Error("Booking already cancelled");
        }

        const event = await eventRepository.findOne({
          where: { id: booking.event.id },
          lock: { mode: "pessimistic_write" },
        });

        if(!event) {
           throw new Error ("Event not found") 
        }

        const wasConfirmed = booking.status === BookingStatus.CONFIRMED;
        booking.status = BookingStatus.CANCELLED;
        await bookingRepository.save(booking);

        if (wasConfirmed) {
          event.available_tickets += 1;

          // Get first waiting list booking (FIFO)
          const waitingBooking = await bookingRepository.findOne({
            where: { event: { id: event.id }, status: BookingStatus.WAITLIST },
            order: { created_at: "ASC" },
          });
          if (waitingBooking) {
            waitingBooking.status = BookingStatus.CONFIRMED;
            event.available_tickets -= 1; // assign the freed ticket
            await bookingRepository.save(waitingBooking);
          }
          await eventRepository.save(event);
        }
      }
    );
  }

  async getEventStatus(
    eventId: string
  ): Promise<{ availableTickets: number; waitingListCount: number }> {
    const eventRepository = AppDataSource.getRepository(Event);
    const bookingRepository = AppDataSource.getRepository(Booking);
    const event = await eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new Error("Event not found");
    }
    const waitingListCount = await bookingRepository.count({
      where: { event: { id: event.id }, status: BookingStatus.WAITLIST },
    });
    return {
      availableTickets: event.available_tickets,
      waitingListCount,
    };
  }
}
