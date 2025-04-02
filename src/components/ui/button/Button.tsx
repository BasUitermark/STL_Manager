// components/ui/button/Button.tsx
import React, { forwardRef } from "react";
import { ButtonProps } from "./button.types";

/**
 * Button component with customizable styling
 *
 * @example
 * ```tsx
 * <Button
 *   variant="solid"
 *   colorScheme="highlight"
 *   size="md"
 *   onClick={handleClick}
 * >
 *   Click Me
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "solid",
      size = "md",
      colorScheme = "highlight",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      rounded = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-2.5 text-lg",
      xl: "px-8 py-3 text-xl",
    };

    // Get variant classes based on color scheme
    const getVariantClasses = () => {
      const colors = {
        main: {
          solid: "bg-main-600 hover:bg-main-700 text-white",
          outline: "border border-main-600 text-main-600 hover:bg-main-50",
          ghost: "text-main-600 hover:bg-main-50",
          link: "text-main-600 hover:text-main-700 underline hover:no-underline",
          subtle: "bg-main-100 text-main-800 hover:bg-main-200",
        },
        highlight: {
          solid: "bg-highlight-500 hover:bg-highlight-600 text-white",
          outline: "border border-highlight-500 text-highlight-500 hover:bg-highlight-50",
          ghost: "text-highlight-500 hover:bg-highlight-50",
          link: "text-highlight-500 hover:text-highlight-600 underline hover:no-underline",
          subtle: "bg-highlight-100 text-highlight-800 hover:bg-highlight-200",
        },
        success: {
          solid: "bg-green-500 hover:bg-green-600 text-white",
          outline: "border border-green-500 text-green-500 hover:bg-green-50",
          ghost: "text-green-500 hover:bg-green-50",
          link: "text-green-500 hover:text-green-600 underline hover:no-underline",
          subtle: "bg-green-100 text-green-800 hover:bg-green-200",
        },
        warning: {
          solid: "bg-yellow-500 hover:bg-yellow-600 text-white",
          outline: "border border-yellow-500 text-yellow-500 hover:bg-yellow-50",
          ghost: "text-yellow-500 hover:bg-yellow-50",
          link: "text-yellow-500 hover:text-yellow-600 underline hover:no-underline",
          subtle: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        },
        danger: {
          solid: "bg-red-500 hover:bg-red-600 text-white",
          outline: "border border-red-500 text-red-500 hover:bg-red-50",
          ghost: "text-red-500 hover:bg-red-50",
          link: "text-red-500 hover:text-red-600 underline hover:no-underline",
          subtle: "bg-red-100 text-red-800 hover:bg-red-200",
        },
      };

      return colors[colorScheme][variant];
    };

    const variantClasses = getVariantClasses();
    const roundedClasses = rounded ? "rounded-full" : "rounded-md";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`
          ${sizeClasses[size]}
          ${variantClasses}
          ${roundedClasses}
          ${fullWidth ? "w-full" : ""}
          ${variant !== "link" ? "font-medium shadow-sm" : ""}
          inline-flex items-center justify-center
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-highlight-500 focus:ring-opacity-30
          ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
