// import { fn } from "@storybook/test";
import type { Meta, StoryObj } from "@storybook/react";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import { DocsContainer } from "@storybook/blocks";
import StructuredSearch from "./src/components/StructuredSearch";
import {
  AUTHOR_FILTER,
  MOCK_FILTERS,
  OPERATORS,
  getRandomItemNameOptions,
  mockAsyncFunction,
} from "./src/dev/mock";
import {
  CodeSandboxOutlined,
  GlobalOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

type Story = StoryObj<typeof StructuredSearch>;

/**
 * A React library that provides autocomplete search queries with dynamic suggestions ( callbacks are passed in ).
 */

const CustomContainer = ({ children, context, ...props }) => {
  return (
    <DocsContainer context={context} {...props}>
      {children}
      <Analytics />
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
    defaultQueryKey: {
      description: "Default added filter after user enters text only",
    },
    prefixIcon: {
      description: "Prefix icon of the search input",
    },
    groupIcon: {
      description: "Icon of the group items",
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: { onClick: fn() },
} satisfies Meta<typeof StructuredSearch>;

const commonProps = { dropdownStyle: { maxWidth: 500 } };

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Demo: Story = {
  args: {
    ...commonProps,
    filters: MOCK_FILTERS,
  },
};

export const GroupFilters: Story = {
  args: {
    ...commonProps,
    filters: [
      {
        value: "group-1",
        name: "Group 1",
        icon: <CodeSandboxOutlined />,
        subText: "This is a group",
        tagColor: "#F09801",
        children: [
          {
            value: "group-2",
            name: "Group 2",
            icon: <GlobalOutlined />,
            subText: "This is a group",
            tagColor: "green",
            children: [AUTHOR_FILTER],
          },
          {
            value: "item-a",
            name: "Item A",
            icon: <SafetyOutlined />,
            subText: "An item in Group 1",
            tagColor: "green",
            operators: [OPERATORS.Equal, OPERATORS.NotEqual],
            options: getRandomItemNameOptions("ItemA"),
          },
        ],
      },
    ],
  },
};

export const MultipleOptions: Story = {
  args: {
    ...commonProps,
    filters: [
      {
        value: "item-a",
        name: "Item A",
        icon: <CodeSandboxOutlined />,
        subText: "This is a multi options item",
        tagColor: "green",
        hasMultiOptions: true,
        operators: [OPERATORS.Equal, OPERATORS.NotEqual],
        options: getRandomItemNameOptions("ItemA"),
      },
    ],
  },
};

export const TypeaheadSuggestion: Story = {
  args: {
    ...commonProps,
    filters: [
      {
        value: "item-a",
        name: "Item A",
        icon: <CodeSandboxOutlined />,
        subText: "Item has async typeahead suggestion",
        tagColor: "green",
        hasMultiOptions: true,
        operators: [OPERATORS.Equal, OPERATORS.NotEqual],
        options: async (searchText) =>
          mockAsyncFunction(getRandomItemNameOptions("ItemA")),
      },
    ],
  },
};
