import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Event } from "./entities/Event";
import { Booking } from "./entities/Booking";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Event, Booking],
  migrations: ["src/migrations/*.ts"],
});
