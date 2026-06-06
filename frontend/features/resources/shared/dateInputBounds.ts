export function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayDateInputValue(): string {
  return toDateInputValue(new Date());
}

export function shiftDateInputValue(value: string, days: number): string {
  const base = toDateInputValue(value);
  if (!base) return "";
  const date = new Date(`${base}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

/** Ngày gieo: không chọn tương lai */
export function seedingDateBounds() {
  return { max: todayDateInputValue() };
}

/** Ngày thu hoạch: sau ngày gieo, không tương lai */
export function harvestDateBounds(seedingDate: unknown) {
  const seeding = toDateInputValue(seedingDate);
  const today = todayDateInputValue();
  const min = seeding ? shiftDateInputValue(seeding, 1) : "";
  let max = today;
  if (min && max < min) max = min;
  return { min, max };
}

export function toLocalDate(value: unknown): Date | undefined {
  const iso = toDateInputValue(value);
  if (!iso) return undefined;
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Props khóa lịch react-admin DateInput (MUI X) + input HTML */
export function datePickerBounds(bounds: { min?: string; max?: string }) {
  const htmlInput: Record<string, string> = {};
  if (bounds.min) htmlInput.min = bounds.min;
  if (bounds.max) htmlInput.max = bounds.max;
  return {
    minDate: bounds.min ? toLocalDate(bounds.min) : undefined,
    maxDate: bounds.max ? toLocalDate(bounds.max) : undefined,
    inputProps: htmlInput,
    slotProps: { htmlInput, field: { clearable: false } },
  };
}
