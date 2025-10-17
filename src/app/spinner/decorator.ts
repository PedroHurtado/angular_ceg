// spinner-handler.interface.ts
export interface SpinnerHandler {
  spinnerOn(): void;
  spinnerOff(): void;
  handleError(error: unknown): void; // más descriptivo que "error"
}

// with-spinner.decorator.ts
export function WithSpinner() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const handler = this as SpinnerHandler;

      // Validación en desarrollo
      if (!handler.spinnerOn || !handler.spinnerOff || !handler.handleError) {
        throw new Error(
          `Component must implement SpinnerHandler interface to use @WithSpinner decorator`
        );
      }


      try {
        handler.spinnerOn();
        return await originalMethod.apply(this, args);
      } catch (error) {
        handler.handleError(error);
      } finally {
        handler.spinnerOff();
      }
    };

    return descriptor;
  };
}
