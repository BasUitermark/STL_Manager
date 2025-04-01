"use client";

// components/ui/select/Select.tsx
import React, { forwardRef, useMemo, useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { SelectProps, SelectGroupOption, SelectOption } from "./select.types";

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      size = "md",
      position = "bottom",
      fullWidth = false,
      label,
      helperText,
      error,
      placeholder = "Select an option",

      // Theme options
      theme = "light",
      backgroundColor,
      textColor,
      highlightColor,
      borderColor,
      accentColor,

      // Class overrides
      className,
      triggerClassName = "",
      contentClassName = "",

      // Behavior props
      clearable = false,
      closeOnSelect = true,
      disabled,
      required,
      value,
      onValueChange,
      open,
      onOpenChange,
      name,
      ...props
    },
    ref
  ) => {
    // Generate ID for accessibility using useId for stable server/client IDs
    const selectIdBase = useId();
    const selectId = `select-${selectIdBase}`;

    // Calculate if we have grouped options
    const hasGroups = useMemo(() => {
      return options.some((option) => typeof option === "object" && "options" in option);
    }, [options]);

    // Size classes
    const sizeClasses = {
      sm: "h-8 text-sm",
      md: "h-10 text-base",
      lg: "h-12 text-lg",
    };

    // Get theme colors based on preset or custom colors
    const getThemeColors = () => {
      // Determine if using dark theme
      const isDark = theme === "dark" || (backgroundColor && backgroundColor.includes("bg-main-9"));

      // Base colors - either from props or default theme
      const bg = backgroundColor || (isDark ? "bg-main-900" : "bg-white");
      const text = textColor || (isDark ? "text-main-100" : "text-main-900");

      // Fix for highlight colors - separate background from text color
      const highlight = highlightColor || (isDark ? "bg-main-800" : "bg-highlight-50");

      // Hover state should be different from selected state
      const hoverBg = isDark ? "hover:bg-main-700" : "hover:bg-main-100";

      return {
        bg,
        text,
        highlight,
        // Different styling for selected text based on theme
        highlightText: isDark ? "text-main-50" : "text-highlight-700",
        border: borderColor || (isDark ? "border-main-700" : "border-main-300"),
        accent: accentColor || (isDark ? "text-highlight-400" : "text-highlight-500"),
        muted: isDark ? "text-main-400" : "text-main-500",
        divider: isDark ? "bg-main-700" : "bg-main-200",
        // Separate hover and focus states
        hoverBg,
        focusBg: isDark ? "focus:bg-main-700" : "focus:bg-main-100",
        focusRing: "focus:ring-highlight-500",
        error: isDark ? "text-red-400" : "text-red-500",
        errorBorder: isDark ? "border-red-800" : "border-red-500",
      };
    };

    const colors = getThemeColors();

    // Handle clear button click
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.("");
    };

    // Custom onValueChange that respects closeOnSelect
    const handleValueChange = (val: string) => {
      onValueChange?.(val);

      // Update the hidden input for form submission
      if (name) {
        const hiddenInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
        if (hiddenInput) hiddenInput.value = val;
      }

      // Close the select if closeOnSelect is true
      if (closeOnSelect) {
        onOpenChange?.(false);
      }
    };

    // Render the options
    const renderOptions = () => {
      return options.map((option, index) => {
        if (option === "divider") {
          return (
            <SelectPrimitive.Separator
              key={`divider-${index}`}
              className={`h-px my-1 ${colors.divider}`}
            />
          );
        }

        if ("options" in option) {
          // It's a group
          const group = option as SelectGroupOption;
          return (
            <SelectPrimitive.Group key={group.label}>
              <SelectPrimitive.Label
                className={`px-2 py-1.5 text-xs font-semibold ${colors.muted}`}
              >
                {group.label}
              </SelectPrimitive.Label>
              {/* Filter out disabled options if the group is disabled */}
              {group.options.map((groupOption) =>
                renderOption({
                  ...groupOption,
                  disabled: group.disabled || groupOption.disabled,
                })
              )}
            </SelectPrimitive.Group>
          );
        }

        // It's a simple option
        return renderOption(option as SelectOption);
      });
    };

    // Render a single option - fix for highlighting issue
    const renderOption = (option: SelectOption) => (
      <SelectPrimitive.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className={`
          relative flex items-center px-2 py-2 rounded-sm 
          outline-none cursor-pointer select-none 
          ${colors.text} ${colors.hoverBg} ${colors.focusBg}
          data-[disabled]:opacity-50 data-[disabled]:pointer-events-none 
          data-[state=checked]:${colors.highlight}
        `}
      >
        <SelectPrimitive.ItemText>
          <div className="flex items-center">
            {option.icon && <span className="mr-2">{option.icon}</span>}
            <span className={value === option.value ? colors.highlightText : ""}>
              {option.label}
            </span>
          </div>
          {option.description && (
            <span className={`block text-xs ${colors.muted}`}>{option.description}</span>
          )}
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
          <Check size={16} className={colors.accent} />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    );

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className || ""}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium ${colors.text} mb-1 ${
              disabled ? "opacity-50" : ""
            }`}
          >
            {label}
            {required && <span className={colors.error + " ml-1"}>*</span>}
          </label>
        )}

        <SelectPrimitive.Root
          value={value}
          onValueChange={handleValueChange}
          open={open}
          onOpenChange={onOpenChange}
          disabled={disabled}
          {...props}
        >
          <div className="relative">
            <SelectPrimitive.Trigger
              ref={ref}
              id={selectId}
              aria-label={label}
              className={`
                flex items-center justify-between 
                ${sizeClasses[size]}
                ${colors.bg} ${colors.text} ${colors.border}
                ${fullWidth ? "w-full" : ""}
                px-3 
                rounded-md
                ${error ? colors.errorBorder + " focus:ring-red-500" : colors.focusRing}
                outline-none 
                border focus:ring-2 focus:ring-opacity-30
                disabled:opacity-50 disabled:cursor-not-allowed
                ${triggerClassName}
              `}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
              }
            >
              <div className="flex items-center justify-between flex-1">
                <SelectPrimitive.Value placeholder={placeholder} />
                {clearable && value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`p-1 ml-1 ${colors.muted} rounded-full hover:${colors.bg.replace(
                      "bg-",
                      "bg-opacity-50"
                    )}`}
                    aria-label="Clear selection"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <SelectPrimitive.Icon className={`ml-2 ${colors.accent}`}>
                <ChevronDown size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={value || ""} />}

            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                position={position === "auto" ? "popper" : undefined}
                side={position === "top" ? "top" : position === "bottom" ? "bottom" : undefined}
                sideOffset={5}
                className={`
                  z-50 
                  min-w-[var(--radix-select-trigger-width)]
                  max-h-[var(--radix-select-content-available-height)]
                  ${colors.bg}
                  rounded-md 
                  overflow-hidden 
                  shadow-lg 
                  border ${colors.border}
                  ${contentClassName}
                `}
              >
                <SelectPrimitive.ScrollUpButton
                  className={`flex items-center justify-center h-6 ${colors.bg} ${colors.muted} cursor-default`}
                >
                  <ChevronUp size={18} />
                </SelectPrimitive.ScrollUpButton>
                <SelectPrimitive.Viewport className={`p-1 ${hasGroups ? "max-h-80" : "max-h-60"}`}>
                  {renderOptions()}
                </SelectPrimitive.Viewport>
                <SelectPrimitive.ScrollDownButton
                  className={`flex items-center justify-center h-6 ${colors.bg} ${colors.muted} cursor-default`}
                >
                  <ChevronDown size={18} />
                </SelectPrimitive.ScrollDownButton>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </div>
        </SelectPrimitive.Root>

        {error ? (
          <p id={`${selectId}-error`} className={`mt-1 text-xs ${colors.error}`}>
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className={`mt-1 text-xs ${colors.muted}`}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
