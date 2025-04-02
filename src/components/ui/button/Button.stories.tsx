// src/components/ui/button/Button.stories.tsx
import { Button } from "@/components/ui/button";
import type { Meta, StoryObj } from "@storybook/react";
import { Mail, ArrowRight } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "link", "subtle"],
      description: "The visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "The size of the button",
    },
    colorScheme: {
      control: "select",
      options: ["main", "highlight", "success", "warning", "danger"],
      description: "The color scheme to use for the button",
    },
    fullWidth: {
      control: "boolean",
      description: "Whether the button takes the full width of its container",
    },
    isLoading: {
      control: "boolean",
      description: "Whether the button is in a loading state",
    },
    rounded: {
      control: "boolean",
      description: "Whether the button has fully rounded corners",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    leftIcon: {
      control: { disable: true },
      description: "Icon to display before the button text",
    },
    rightIcon: {
      control: { disable: true },
      description: "Icon to display after the button text",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Base Button
export const Default: Story = {
  args: {
    children: "Button",
    variant: "solid",
    size: "md",
    colorScheme: "highlight",
  },
};

// Button Variants
export const Solid: Story = {
  args: {
    children: "Solid Button",
    variant: "solid",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link Button",
    variant: "link",
  },
};

export const Subtle: Story = {
  args: {
    children: "Subtle Button",
    variant: "subtle",
  },
};

// Button Sizes
export const ExtraSmall: Story = {
  args: {
    children: "Extra Small",
    size: "xs",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    children: "Extra Large",
    size: "xl",
  },
};

// Color Schemes
export const Main: Story = {
  args: {
    children: "Main Color",
    colorScheme: "main",
  },
};

export const Highlight: Story = {
  args: {
    children: "Highlight Color",
    colorScheme: "highlight",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    colorScheme: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning",
    colorScheme: "warning",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger",
    colorScheme: "danger",
  },
};

// Button States
export const Loading: Story = {
  args: {
    children: "Loading",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};

export const Rounded: Story = {
  args: {
    children: "Rounded Button",
    rounded: true,
  },
};

// Buttons with Icons
export const WithLeftIcon: Story = {
  args: {
    children: "Email",
    leftIcon: <Mail size={16} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Next",
    rightIcon: <ArrowRight size={16} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Email",
    leftIcon: <Mail size={16} />,
    rightIcon: <ArrowRight size={16} />,
  },
};

// Button Collection Story
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="solid">Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="subtle">Subtle</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button colorScheme="main">Main</Button>
        <Button colorScheme="highlight">Highlight</Button>
        <Button colorScheme="success">Success</Button>
        <Button colorScheme="warning">Warning</Button>
        <Button colorScheme="danger">Danger</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
        <Button size="xl">XL</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button rounded>Rounded</Button>
        <Button leftIcon={<Mail size={16} />}>With Icon</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};
