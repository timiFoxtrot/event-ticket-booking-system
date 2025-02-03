import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Event } from "./Event";

export enum BookingStatus {
  CONFIRMED = "confirmed",
  WAITLIST = "waitlist",
  CANCELLED = "cancelled",
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  user: string;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @ManyToOne(() => Event, (event) => event.bookings)
  event: Event;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
