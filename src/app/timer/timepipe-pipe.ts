import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timepipe'
})
export class TimepipePipe implements PipeTransform {

  transform(value: Date ): string {
    return value.toLocaleTimeString("es-ES")
  }

}
