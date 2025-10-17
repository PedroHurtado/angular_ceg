
import { signal } from "@angular/core";
// spinner-handler.interface.ts

export interface SpinnerHandler {
  spinnerOn(): void;
  spinnerOff(): void;
  handleError(error: unknown): void; // más descriptivo que "error"
}

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
