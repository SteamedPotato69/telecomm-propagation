import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseDecimal } from '../../utils/validation';
import { NumericField } from '../NumericField';

interface PlanNumberFieldProps {
  label: string;
  unit?: string;
  /** The saved value. */
  value: number;
  /** Called only with a valid, finite number. */
  onChange: (value: number) => void;
  helperText?: string;
}

/**
 * A numeric field backed by a NUMBER (the plan's saved value) instead of raw text.
 *
 * It keeps its own text while the student types, and reports a value upward
 * only when the text is a valid finite number -- so a half-typed "2." or an
 * empty field never puts NaN into the plan. While the text is not valid the
 * field turns red and the last valid value stays in use. When the saved value
 * changes from elsewhere (restarting from the course example), the text follows.
 */
export function PlanNumberField({ label, unit, value, onChange, helperText }: PlanNumberFieldProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(String(value));
  const parsed = parseDecimal(text);
  const invalid = !Number.isFinite(parsed);

  useEffect(() => {
    if (parseDecimal(text) !== value) setText(String(value));
    // Only react to the saved value changing; the typed text is allowed to differ from it while invalid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (next: string) => {
    setText(next);
    const number = parseDecimal(next);
    if (Number.isFinite(number)) onChange(number);
  };

  return (
    <NumericField
      label={label}
      unit={unit}
      value={text}
      onChangeText={handleChange}
      invalid={invalid}
      helperText={invalid ? t('plan.shell.invalidNumber') : helperText}
    />
  );
}
