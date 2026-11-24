import type { Request, Response } from "express";
import type {
  AvailabilityQuery,
  CreateCarInput,
  CreateCarUnitInput,
  UpdateCarInput,
  UpdateCarStatusInput,
  UpdateCarUnitInput,
} from "./car.schema.js";
import { CarService } from "./car.service.js";

export class CarController {
  constructor(private readonly service: CarService) {}

  listPublicCars = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.listCars(false);
    res.status(200).json({ data });
  };

  checkAvailability = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug ?? "");
    const query = res.locals.query as AvailabilityQuery;
    const data = await this.service.checkAvailability(slug, query);
    res.status(200).json({ data });
  };

  listAdminCars = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.listCars(true);
    res.status(200).json({ data });
  };

  createCar = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as CreateCarInput;
    const data = await this.service.createCar(input);
    res.status(201).json({ data });
  };

  updateCar = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const input = req.body as UpdateCarInput;
    const data = await this.service.updateCar(id, input);
    res.status(200).json({ data });
  };

  updateCarStatus = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const { status } = req.body as UpdateCarStatusInput;
    const data = await this.service.updateCarStatus(id, status);
    res.status(200).json({ data });
  };

  deleteCar = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    await this.service.deleteCar(id);
    res.status(200).json({ data: { deleted: true } });
  };

  addCarUnit = async (req: Request, res: Response): Promise<void> => {
    const carId = String(req.params.id ?? "");
    const input = req.body as CreateCarUnitInput;
    const data = await this.service.addUnit(carId, input);
    res.status(201).json({ data });
  };

  updateCarUnit = async (req: Request, res: Response): Promise<void> => {
    const unitId = String(req.params.unitId ?? "");
    const input = req.body as UpdateCarUnitInput;
    const data = await this.service.updateUnit(unitId, input);
    res.status(200).json({ data });
  };

  deleteCarUnit = async (req: Request, res: Response): Promise<void> => {
    const unitId = String(req.params.unitId ?? "");
    await this.service.deleteUnit(unitId);
    res.status(200).json({ data: { deleted: true } });
  };
}
