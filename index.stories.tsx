// import { fn } from "@storybook/test";
import type { Meta, StoryObj } from "@storybook/react";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import { DocsContainer } from "@storybook/blocks";
import StructuredSearch from "./src/components/StructuredSearch";
import { mockFilters } from "./src/dev/mock";

type Story = StoryObj<typeof StructuredSearch>;

/**
 * A React library that provides autocomplete search queries with dynamic suggestions ( callbacks are passed in ).
 */

const CustomContainer = ({ children, context, ...props }) => {
  return (
    <DocsContainer context={context} {...props}>
      {children}
      <Analytics/>
    </DocsContainer>
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "react-structured-search",
  component: StructuredSearch,
  parameters: {
    // layout: "centered",
    docs: {
      container: CustomContainer,
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    onSubmit: {
      description: "Fires when pressing enter or submit",
    },
    onChange: {
      description: "Fires when tags change",
    },
    clearAfterSearch: {
      description: "Clear search box after pressing enter",
    },
    queryFilterKey: {
      description: "Default query search key",
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: { onClick: fn() },
} satisfies Meta<typeof StructuredSearch>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const DisableItems: Story = {
  args: {
    filters: mockFilters(),
  },
};

export const HideItems: Story = {
  args: {
    filters: mockFilters(true),
  },
};
