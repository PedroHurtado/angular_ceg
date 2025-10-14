export interface CalendarDay {
    date: Date;
    day: number;
    month: number;
    year: number;
    dayOfWeek: number;
    isCurrentMonth: boolean;
}

/**
 *
 * Todos los meses día 1
 * Todos los días pertenecen a una semna que tiene lunes o domigo(primer day)
 * un bucle hasta 42 suman 1 a la fecha anterior
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator
 */
export function* generateCalendar(date?: Date): Generator<CalendarDay> {
    const baseDate = date || new Date();

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);

    let dayOfWeek = firstDayOfMonth.getDay();

    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        yield {
            date: new Date(currentDate),
            day: currentDate.getDate(),
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
            dayOfWeek: currentDate.getDay(),
            isCurrentMonth: currentDate.getMonth() === month
        };
    }
}
