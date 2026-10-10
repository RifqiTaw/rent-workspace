import { DURATION_DISCOUNT_RATES, RENTAL_DURATIONS } from "../data/rental-terms";
import type { RentalDuration } from "../types";

interface RentalDurationPickerProps {
  value: RentalDuration;
  disabled?: boolean;
  onChange: (months: RentalDuration) => void;
}

/** Segmented single-choice control built on native radios. */
export function RentalDurationPicker({ value, disabled, onChange }: RentalDurationPickerProps) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">Rental duration</legend>
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
        {RENTAL_DURATIONS.map((months) => {
          const discount = DURATION_DISCOUNT_RATES[months];
          return (
            <label
              key={months}
              className="flex cursor-pointer flex-col items-center rounded-md px-1 py-1.5 text-center text-muted-foreground transition-[background-color,color,box-shadow] hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed"
            >
              <input
                type="radio"
                name="rental-duration"
                value={months}
                checked={value === months}
                onChange={() => onChange(months)}
                className="sr-only"
              />
              <span className="text-sm font-medium tabular-nums">
                {months} mo
              </span>
              <span className="text-[0.7rem] leading-4 text-brand">
                {discount > 0 ? `−${Math.round(discount * 100)}%` : " "}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
