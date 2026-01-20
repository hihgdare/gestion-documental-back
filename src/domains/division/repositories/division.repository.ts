import { Division } from "../entities/division.entity";

export interface DivisionRepository {
  findById(id: string): Promise<Division | null>;
  findAll(): Promise<Division[]>;
  create(division: Division): Promise<Division>;
  update(division: Division): Promise<Division>;
  delete(id: string): Promise<void>;
}
