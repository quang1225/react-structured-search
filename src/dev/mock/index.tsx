import {
  SearchOutlined,
  GlobalOutlined,
  CodeSandboxOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DEFAULT_QUERY_FILTER_KEY,
  Filter,
  type Option,
} from "../../components/StructuredSearch";
import React from "react";

// START mock
export const mockAsyncFunction = (
  obj: Option[],
  delay = 500,
): Promise<Option[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(obj);
    }, delay);
  });

export const getRandomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const getRandomItemNameOptions = (name: string) => {
  const result: string[] = [];
  const numItems = getRandomNumberBetween(3, 10); // Generate a random number of items between 0 and 9

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numItems; i++) {
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    result.push(`${name} ${randomNumber}`);
  }

  return result.map((x) => ({ value: x, name: x }) as Option);
};

const OPERATORS = {
  Equal: {
    value: "=",
    name: "=",
    subText: "is",
  },
  NotEqual: {
    value: "!=",
    name: "!=",
    subText: "is not",
  },
};

export const mockFilters = (isHidden = false): Filter[] => [
  {
    value: DEFAULT_QUERY_FILTER_KEY,
    name: "Search text",
    icon: <SearchOutlined />,
    subText: "Name includes",
    operators: [OPERATORS.Equal],
  },
  {
    value: "domain",
    name: "Domain",
    icon: <GlobalOutlined />,
    subText: "In a domain",
    tagColor: "gold",
    [isHidden ? "hidden" : "disabled"]: (tagValues) =>
      !!tagValues.find((value) => value.startsWith("namespace")),
    disableTooltip: { title: "Disabled because Namespace existed" },
    operators: [OPERATORS.Equal, OPERATORS.NotEqual],
    typeaheadCallback: async (searchText) =>
      mockAsyncFunction(getRandomItemNameOptions("Domain")),
  },
  {
    value: "namespace",
    name: "Namespace",
    icon: <CodeSandboxOutlined />,
    subText: "In a namespace",
    tagColor: "green",
    [isHidden ? "hidden" : "disabled"]: (tagValues) =>
      !!tagValues.find((value) => value.startsWith("domain")),
    disableTooltip: { title: "Disabled because Domain existed" },
    operators: [OPERATORS.Equal, OPERATORS.NotEqual],
    typeaheadCallback: async (searchText) =>
      mockAsyncFunction(getRandomItemNameOptions("Namespace")),
  },
  {
    value: "author",
    name: "Author",
    icon: <UserOutlined />,
    subText: "By an author account or email",
    tagColor: "cyan",
    operators: [OPERATORS.Equal, OPERATORS.NotEqual],
    typeaheadCallback: async (searchText) =>
      mockAsyncFunction(getRandomItemNameOptions("Author")),
  },
];
// END mock
