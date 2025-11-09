import type { Container } from "inversify";

export interface IUnitOfWork {
  transaction<T>(callback: (container: Container) => Promise<T>): Promise<T>;
}
