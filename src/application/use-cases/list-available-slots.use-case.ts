import { inject, injectable } from "inversify";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadAvailabilityRepository } from "../ports/repositories/availability.repository";

type ListAvailableSlotsInput = {
  doctorId: string;
};

type SlotOutput = {
  slotId: string;
  startDateTime: Date;
  endDateTime: Date;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
};

type ListAvailableSlotsOutput = {
  doctorId: string;
  availableSlots: SlotOutput[];
};

@injectable()
export class ListAvailableSlotsUseCase {
  constructor(
    @inject(SYMBOLS.IReadAvailabilityRepository)
    private readonly readAvailabilityRepository: IReadAvailabilityRepository,
  ) {}

  async execute(input: ListAvailableSlotsInput): Promise<ListAvailableSlotsOutput> {
    const doctorId = Uuid.fromString(input.doctorId);
    const now = new Date();
    const availabilities = await this.readAvailabilityRepository.findByDoctorId(doctorId);
    const validSlots = availabilities
      .flatMap((availability) => availability.slots)
      .filter((slot) => {
        const isAvailable = slot.status === "AVAILABLE";
        const isFuture = slot.startDateTime > now;
        return isAvailable && isFuture;
      })
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    const output: SlotOutput[] = validSlots.map((slot) => ({
      slotId: slot.id,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      status: slot.status,
    }));
    return {
      doctorId: doctorId.value,
      availableSlots: output,
    };
  }
}
