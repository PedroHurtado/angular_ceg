import { SpinnerHandler } from "./decorator";
import { signal } from "@angular/core";
export abstract class SpinnerComponent implements SpinnerHandler {
  protected loading = signal(false);

  spinnerOn() {
    this.loading.set(true);
  }

  spinnerOff() {
    this.loading.set(false);
  }

  abstract handleError(error: unknown): void;
}
