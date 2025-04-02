// components/ui/button/button.types.ts
import { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "solid" // Filled background (primary)
  | "outline" // Border only
  | "ghost" // No background or border
  | "link" // Looks like a link with underline
  | "subtle"; // Light background

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonColorScheme = "main" | "highlight" | "success" | "warning" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button
   * @default "solid"
   */
  variant?: ButtonVariant;

  /**
   * The size of the button
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * The color scheme to use for the button
   * @default "highlight"
   */
  colorScheme?: ButtonColorScheme;

  /**
   * Whether the button takes the full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * Content of the button
   */
  children?: React.ReactNode;

  /**
   * Whether the button has rounded corners
   * @default false
   */
  rounded?: boolean;
}
