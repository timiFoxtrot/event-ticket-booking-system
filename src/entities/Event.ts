import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Booking } from "./Booking";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  total_tickets: number;

  @Column()
  available_tickets: number;

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
