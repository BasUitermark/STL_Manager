// components/ui/select/select.types.ts
import { ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "filled" | "unstyled";
export type SelectPlacement = "top" | "bottom" | "auto";

// New simple theme type
export type SelectTheme = "light" | "dark" | "custom";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, "children"> {
  options: (SelectOption | SelectGroupOption | "divider")[];
  size?: SelectSize;
  variant?: SelectVariant;
  position?: SelectPlacement;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;

  // Simple theme options
  theme?: SelectTheme;

  // Core color overrides - these affect the entire component
  backgroundColor?: string; // e.g. "bg-main-900"
  textColor?: string; // e.g. "text-main-100"
  highlightColor?: string; // e.g. "bg-main-800"
  borderColor?: string; // e.g. "border-main-700"
  accentColor?: string; // e.g. "text-highlight-500" (for arrows, checks)

  // Optional class overrides for specific parts (still available if needed)
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;

  // Behavior
  clearable?: boolean;
  closeOnSelect?: boolean;
}
