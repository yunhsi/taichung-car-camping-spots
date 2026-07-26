"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface AttractionMultiSelectProps {
  id: string;
  label: string;
  options: readonly string[];
  emptyOptionLabel: string;
  value: string[];
  onValueChange: (value: string[]) => void;
}

const EMPTY_VALUE = "__all__";

function getSelectedLabel(value: string[], emptyOptionLabel: string): string {
  if (value.length === 0) {
    return emptyOptionLabel;
  }

  if (value.length === 1) {
    return value[0];
  }

  return `已選 ${value.length} 個`;
}

export function AttractionMultiSelect({
  id,
  label,
  options,
  emptyOptionLabel,
  value,
  onValueChange,
}: AttractionMultiSelectProps) {
  const selectValue = value.length === 0 ? [EMPTY_VALUE] : value;

  function handleValueChange(nextValue: string[]) {
    if (!nextValue.includes(EMPTY_VALUE)) {
      onValueChange(nextValue);
      return;
    }

    if (selectValue.includes(EMPTY_VALUE) && nextValue.length > 1) {
      onValueChange(nextValue.filter((option) => option !== EMPTY_VALUE));
      return;
    }

    onValueChange([]);
  }

  return (
    <Select multiple value={selectValue} onValueChange={handleValueChange}>
      <SelectLabel>{label}</SelectLabel>
      <SelectTrigger id={id}>
        <SelectValue
          className={value.length === 0 ? "text-muted-foreground" : undefined}
        >
          {() => getSelectedLabel(value, emptyOptionLabel)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_VALUE}>{emptyOptionLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
