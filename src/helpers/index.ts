import { StructuredSearchFilterValue, Filter, StructuredSearchValue } from "../components/StructuredSearch";

export const getSelectValue = ({ filterKey, operatorKey, value }: StructuredSearchFilterValue) =>
  `${filterKey}${operatorKey || ""}${value || ""}`;

export const convertBoxValueToSearchValue = (tagValue: string): StructuredSearchFilterValue => {
  const operatorKey = tagValue.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/g)?.[0];
  let filterKey = tagValue;
  let value = "";

  if (operatorKey) {
    const splitArray = tagValue.split(operatorKey);
    filterKey = splitArray[0];
    value = splitArray[1];
  }

  return { filterKey, operatorKey, value };
};

export const mapBoxValuesToSumitValue = (boxValues: string[], data: Filter[]): StructuredSearchValue => {
  const searchObj = boxValues.reduce(
    (prev, tagValue) => {
      const { filterKey, operatorKey, value } = convertBoxValueToSearchValue(tagValue);
      const filterObj = findFilterByValue(data, filterKey);

      const isGroup = !!filterObj?.children && filterKey;

      const filters = prev.filters.concat(isGroup ? [] : [{ filterKey, operatorKey, value }]);
      const groupFilterKeys = prev.groupFilterKeys.concat(isGroup ? [filterKey] : []);

      return {
        filters,
        groupFilterKeys,
      } as StructuredSearchValue;
    },
    { filters: [], query: "", groupFilterKeys: [] } as StructuredSearchValue
  );

  return searchObj;
};

export const mapSelectValueToBoxValues = (value?: StructuredSearchValue): string[] => {
  const { filters, groupFilterKeys = [] } = value || {};

  const boxValues =
    filters
      ?.concat(
        groupFilterKeys?.map((key) => ({
          filterKey: key,
        }))
      )
      .map((rs) => getSelectValue(rs)) || [];
  return boxValues;
};

export const findDeepestGroupFilter = (filters: Filter[], values: string[]): Filter | null => {
  let deepestObject = null;
  let maxDepth = -1;

  function recursiveSearch(filters, depth) {
    filters.forEach((filter) => {
      if (filter.children) {
        if (values.includes(filter.value) && depth > maxDepth) {
          deepestObject = filter;
          maxDepth = depth;
        }
        recursiveSearch(filter.children, depth + 1);
      }
    });
  }

  recursiveSearch(filters, 0);
  return deepestObject;
};

export const findFilterByValue = (filters: Filter[], value: string | undefined): Filter | null => {
  if (!value) return null;

  for (const obj of filters) {
    if (obj.value === value) {
      return obj;
    }

    if (obj.children && obj.children.length > 0) {
      const foundObject = findFilterByValue(obj.children, value);
      if (foundObject) {
        return foundObject;
      }
    }
  }
  return null;
};

export const getAllObjectValues = (filters) => {
  return filters.flatMap((item) => {
    // Collect the value of the current item
    const values = [item.value];

    // Recursively collect values from children if they exist
    if (item.children && item.children.length > 0) {
      values.push(...getAllObjectValues(item.children));
    }

    return values;
  });
};

export const moveGroupFilterKeyToTop = (arr) => {
  const groupFilterKey = arr.find((arrValue) => {
    const { filterKey, operatorKey, value } = convertBoxValueToSearchValue(arrValue);
    return filterKey && !operatorKey && !value;
  });
  if (groupFilterKey) {
    const newArray = arr.filter((arrValue) => arrValue !== groupFilterKey);
    newArray.unshift(groupFilterKey);
    return newArray;
  }
  return arr;
};
