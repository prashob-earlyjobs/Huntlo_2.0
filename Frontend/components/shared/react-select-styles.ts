import type { GroupBase, StylesConfig } from "react-select";

export type StringSelectOption = { value: string; label: string };

/** Shared shadcn-aligned styles for react-select controls in forms. */
export function stringSelectStyles(
  invalid?: boolean
): StylesConfig<StringSelectOption, false, GroupBase<StringSelectOption>> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: 32,
      borderRadius: 6,
      borderColor: invalid
        ? "var(--destructive)"
        : state.isFocused
          ? "var(--ring)"
          : "var(--input)",
      boxShadow: state.isFocused
        ? "0 0 0 2px color-mix(in oklab, var(--ring) 50%, transparent)"
        : "none",
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: invalid
          ? "var(--destructive)"
          : state.isFocused
            ? "var(--ring)"
            : "var(--input)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      paddingInline: 10,
      backgroundColor: "transparent",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      fontSize: 14,
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--foreground)",
      fontSize: 14,
    }),
    input: (base) => ({
      ...base,
      color: "var(--foreground)",
      fontSize: 14,
      backgroundColor: "transparent",
      margin: 0,
      padding: 0,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      backgroundColor: state.isSelected
        ? "var(--brand-subtle)"
        : state.isFocused
          ? "var(--muted)"
          : "transparent",
      color: state.isSelected ? "var(--primary)" : "var(--foreground)",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      padding: 6,
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      padding: 6,
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      fontSize: 13,
    }),
  };
}
