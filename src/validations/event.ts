import { celebrate, Joi, Segments } from "celebrate";

export const createEventSchema = celebrate(
  {
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().trim(),
      totalTickets: Joi.number().required(),
    }),
  },
  {
    abortEarly: false,
  }
);
