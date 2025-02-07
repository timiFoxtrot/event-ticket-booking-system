import { Request, Response } from "express";
import { Service } from "typedi";
import { EventService } from "../services/event.service";
import logger from "../utils/logger";

@Service()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  async initializeEvent(req: Request, res: Response): Promise<void> {
    try {
      const { name, totalTickets } = req.body;
      const data = await this.eventService.initializeEvent(name, totalTickets);
      res
        .status(201)
        .json({ success: true, message: "Event created successfully", data });
    } catch (error: any) {
      logger.error(`Error creating event: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bookTicket(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, user } = req.body;
      const data = await this.eventService.bookTicket(eventId, user);
      res
        .status(201)
        .json({ success: true, message: "Ticket booked successfully", data });
    } catch (error: any) {
      logger.error(`Error booking ticket: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.body;
      await this.eventService.cancelBooking(bookingId);
      res
        .status(200)
        .json({ success: true, message: "Booking cancelled successfully" });
    } catch (error: any) {
      logger.error(`Failed to cancel: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEventStatus(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const data = await this.eventService.getEventStatus(eventId);
      res.status(200).json({
        success: true,
        message: "Event status fetched successfully",
        data,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
