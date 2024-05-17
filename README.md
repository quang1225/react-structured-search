## Overview

A React, Typescript library for quickly intergrate autocomplete search queries with dynamic suggestions.

👉 Demo: https://react-structured-search.quang.work/?path=/docs/react-structured-search--demo

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Types](#types)

## Features

- 🔥 Performance optimized
- 🔥 Typescript supported
- 🔥 Dynamic typeahead suggestion with passed in callbacks
- 🔥 Easy to customize

## Install

```bash
npm install react-structured-search
```

or

```bash
yarn add react-structured-search
```

## Usage

Simple use like this:

```js
import { StructuredSearch } from "@data-platform/structured-search";

...

<StructuredSearch
  filters={MOCK_FILTERS}
  dropdownStyle={{ maxWidth: 400 }}
  onSubmit={(rs) => console.log("Search result:", rs)}
/>
```

The example mockFilter() function:

```js
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
```

## Types

| StructuredSearchProps  | Type                                                             | Description                                                          |
| :--------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------- |
| **`filters`**          | Filter[]                                                         | Filters configuration                                                |
| **`value`**            | StructuredSearchValue[]                                          | Current value                                                        |
| **`defaultValue`**     | StructuredSearchValue[]                                          | Default value when init                                              |
| **`onSubmit`**         | (result: StructuredSearchValue[]) => void                        | Handle pressing Enter or submit                                      |
| **`onChange`**         | (values: string[]) => void                                       | Handle changing box values                                           |
| **`onBlur`**           | FocusEventHandler                                                | Handle box lossing focus                                             |
| **`onInputKeyDown`**   | KeyboardEventHandler                                             | Handle box's input keying down                                       |
| **`clearAfterSearch`** | boolean                                                          | Clear the input after pressing Enter or submit                       |
| **`width`**            | number or string                                                 | Width of the search box                                              |
| **`height`**           | number or string                                                 | Height of the search box                                             |
| **`prefixIcon`**       | ReactNode                                                        | Custom prefix icon                                                   |
| **`defaultFilterKey`** | string                                                           | Default added filter after user enters text only ( Filter's values ) |
| **...rest**            | [AntDesignSelectProps](https://ant.design/components/select#api) | All props of Ant Design's Select component                           |

<br/>

| Filter                  | Type                                                                         | Description                                                    |
| :---------------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **`operators`**         | Option[]                                                                     | Operators configuration                                        |
| **`typeaheadCallback`** | (searchText: string) => Promise<Option[]>                                    | API callback when user finish typing search text ( debounced ) |
| **`tagColor`**          | [AntDesignTagColorProp](https://ant.design/components/tag#tag-demo-colorful) | Colors supported by Ant Design's Tag component                 |
| **...rest**             | Option                                                                       | All props of `Option` type                                     |

<br/>

| StructuredSearchValue | Type   | Description                      |
| :-------------------- | :----- | :------------------------------- |
| **`filterKey`**       | string | Filter key value of a filter tag |
| **`operatorKey`**     | string | Operator value of a filter tag   |
| **`value`**           | string | Search value of a filter tag     |

<br/>

| Option               | Type                                                               | Description                                                    |
| :------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------- |
| **`value`**          | string                                                             | Value of the option                                            |
| **`name`**           | string                                                             | Label of the option                                            |
| **`icon`**           | ReactNode                                                          | Icon of the option                                             |
| **`subText`**        | string                                                             | Description of the option                                      |
| **`optionRender`**   | (option: Option) => ReactNode                                      | Custom content of the option                                   |
| **`hidden`**         | (selectedValues: string[]) => boolean;                             | Hide the option, selectedValues is the box's current values    |
| **`disabled`**       | (selectedValues: string[]) => boolean;                             | Disable the option, selectedValues is the box's current values |
| **`disableTooltip`** | [AntDesignTooltipProps](https://ant.design/components/tooltip#api) | Tooltip of the option when disabled                            |
