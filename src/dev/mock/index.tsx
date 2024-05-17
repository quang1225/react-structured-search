import {
  CodeSandboxOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Filter, type Option } from "../../components/StructuredSearch";
import React from "react";

// START mock
export const DEFAULT_QUERY_FILTER_KEY = "query";

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

const authorFilter = {
  value: "author",
  name: "Author",
  icon: <UserOutlined />,
  subText: "By an author account or email",
  tagColor: "cyan",
  operators: [OPERATORS.Equal],
};

export const MOCK_FILTERS: Filter[] = [
  {
    value: "atrributes",
    name: "Attributes",
    icon: <CodeSandboxOutlined />,
    subText: "Search for attributes",
    tagColor: "#F09801",
    disableTooltip: { title: "Disabled because..." },
    children: [
      {
        value: "domain",
        name: "Domain",
        icon: <GlobalOutlined />,
        subText: "In a domain",
        tagColor: "green",
        disableTooltip: { title: "Disabled because Namespace existed" },
        operators: [OPERATORS.Equal, OPERATORS.NotEqual],
        options: async (searchText) =>
          mockAsyncFunction(getRandomItemNameOptions("Domain")),
      },
      authorFilter,
    ],
  },
  {
    value: "segments",
    name: "Segments",
    icon: <ExperimentOutlined />,
    subText: "Search for segments",
    tagColor: "#F09801",
    disableTooltip: { title: "Disabled because..." },
    children: [
      {
        value: "namespace",
        name: "Namespace",
        icon: <SafetyOutlined />,
        subText: "In a namespace",
        tagColor: "green",
        disableTooltip: { title: "Disabled because Domain existed" },
        operators: [OPERATORS.Equal, OPERATORS.NotEqual],
        options: async (searchText) =>
          mockAsyncFunction(getRandomItemNameOptions("Namespace")),
      },
      authorFilter,
    ],
  },
  authorFilter,
];
// END mock
