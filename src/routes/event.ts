import { Router } from "express";
import Container from "typedi";
import { EventController } from "../controllers/event.controller";
import { createEventSchema } from "../validations/event";

const router = Router();

const eventController = Container.get(EventController);

router.post("/initialize", createEventSchema, (req, res) =>
  eventController.initializeEvent(req, res)
);
router.post("/book", (req, res) => eventController.bookTicket(req, res));
router.post("/cancel", (req, res) => eventController.cancelBooking(req, res));
router.get("/status/:eventId", (req, res) =>
  eventController.getEventStatus(req, res)
);

export default router;
