import React, {
  FC,
  useMemo,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  Select,
  SelectProps,
  Spin,
  TagProps,
  Tooltip,
  TooltipProps,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useDebouncedState from "../../hooks/useDebouncedState";
import { StyledSelect, StyledOption, StyledTag } from "./styles";
import { DefaultOptionType } from "antd/es/select";

export type Option = {
  value: string;
  name: string;
  icon?: ReactNode;
  subText?: string;
  optionRender?: (option: Option) => ReactNode;
  disabled?: (selectedValues: string[]) => boolean;
  hidden?: (selectedValues: string[]) => boolean;
  disableTooltip?: TooltipProps;
};

export type Filter = Option & {
  operators: Option[];
  typeaheadCallback?: (searchText: string) => Promise<Option[]>;
  tagColor?: TagColorProp;
};

export type StructuredSearchProps = SelectProps & {
  filters: Filter[];
  value?: StructuredSearchValue[];
  defaultValue?: StructuredSearchValue[];
  onSubmit?: (result: StructuredSearchValue[]) => void;
  onChange?: (values: string[]) => void;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onInputKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  clearAfterSearch?: boolean;
  width?: number | string;
  height?: number | string;
  prefixIcon?: ReactNode;
  defaultFilterKey?: string;
};

export type StructuredSearchValue = {
  filterKey?: string;
  operatorKey?: string;
  value?: string;
};

type TagRender = SelectProps["tagRender"];
export type TagColorProp = TagProps["color"];

const { Option } = Select;

const TYPEAHEAD_DELAY = 400;

let isLastValueEndsWithAnOperatorCallbackState = false;

const getSelectValue = ({
  filterKey,
  operatorKey,
  value,
}: StructuredSearchValue) => `${filterKey}${operatorKey}${value}`;

const mapBoxValuesToSelectValue = (
  boxValues: string[],
): StructuredSearchValue[] => {
  const searchObj: StructuredSearchValue[] = boxValues.reduce(
    (arr, tagValue) => {
      const operatorKey = tagValue.match(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/g,
      )?.[0];
      if (!operatorKey) return arr;

      const splitArray = tagValue.split(operatorKey);

      const filterKey = splitArray[0];
      if (!filterKey) return arr;

      const value = splitArray[1] || "";

      return arr.concat({
        filterKey,
        operatorKey,
        value,
      } as StructuredSearchValue);
    },
    [] as StructuredSearchValue[],
  );

  return searchObj;
};

const mapSelectValueToBoxValues = (
  values?: StructuredSearchValue[],
): string[] => {
  const boxValues: string[] = values?.map((rs) => getSelectValue(rs)) || [];
  return boxValues;
};

const StructuredSearch: FC<StructuredSearchProps> = ({
  filters,
  onSubmit,
  onChange,
  onBlur,
  onInputKeyDown,
  clearAfterSearch = false,
  width = "100%",
  height = 40,
  prefixIcon = <SearchOutlined />,
  defaultFilterKey,
  value,
  defaultValue,
  ...rest
}) => {
  const [boxValues, setBoxValues] = useState<string[]>(
    mapSelectValueToBoxValues(defaultValue),
  );
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchText, , setDebouncedSearchText] = useDebouncedState(
    "",
    TYPEAHEAD_DELAY,
  );
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    setBoxValues(mapSelectValueToBoxValues(value));
  }, [value]);

  const defaultFilterKeyState = defaultFilterKey || filters[0].value;

  // Memoize values for better performance
  const filterValues = useMemo(
    () => Object.values(filters).map((filter) => filter.value),
    [],
  );
  const { operators, operatorValues } = useMemo(() => {
    const cOperators = [
      ...new Set(filters.flatMap((filter) => filter.operators || [])),
    ];
    const cOperatorValues = cOperators.map((operator) => operator.value);

    return { operators: cOperators, operatorValues: cOperatorValues };
  }, []);
  const {
    lastValue,
    lastFilterValue,
    lastFilterOperatorValue,
    lastFilter,
    filterOptions,
    isLastValueAFilterKey,
    isLastValueEndsWithAnOperator,
  } = useMemo<{
    lastValue: string;
    lastFilterValue: string;
    lastFilterOperatorValue: string;
    lastFilter: Filter | undefined;
    filterOptions: Filter[];
    isLastValueAFilterKey: boolean;
    isLastValueEndsWithAnOperator: boolean;
  }>(() => {
    const sLastValue = boxValues.at(-1) || "";
    const sFilterValue = sLastValue.match(/[a-zA-Z]/g)?.join("") || "";
    const sOperatorValue = sLastValue.replace(sFilterValue, "");
    const sCurrentFilterObj = filters.find(
      (filter) => filter.value === sFilterValue,
    );
    const currentFilterOptions = filters.filter(
      (filter) => !boxValues.find((value) => value?.startsWith(filter.value)),
    );
    const sIsLastValueAFilterKey = filterValues.includes(sLastValue);
    const sIsLastValueEndsWithAnOperator = !!operatorValues.find(
      (operatorVal) => sLastValue.endsWith(operatorVal),
    );

    return {
      lastValue: sLastValue,
      lastFilterValue: sFilterValue,
      lastFilter: sCurrentFilterObj,
      lastFilterOperatorValue: sOperatorValue,
      filterOptions: currentFilterOptions,
      isLastValueAFilterKey: sIsLastValueAFilterKey,
      isLastValueEndsWithAnOperator: sIsLastValueEndsWithAnOperator,
    };
  }, [boxValues, filterValues, operatorValues]);

  const tagRender: TagRender = useCallback(
    (props: { label: any; value: any; closable: any; onClose: any }) => {
      const { label, value, closable, onClose } = props;
      const currentFilter = filters.find((filter) =>
        String(value).startsWith(filter.value),
      );
      const disabled =
        (currentFilter?.disabled !== undefined &&
          currentFilter.disabled(boxValues)) ||
        (currentFilter?.hidden !== undefined &&
          currentFilter.hidden(boxValues));
      const disableTooltip = currentFilter?.disableTooltip;

      const onPreventMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        e.stopPropagation();
      };
      return (
        <Tooltip
          {...disableTooltip}
          title={disabled ? disableTooltip?.title : undefined}
        >
          <StyledTag
            icon={currentFilter?.icon}
            color={currentFilter?.tagColor}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{
              marginInlineEnd: 4,
              textDecoration: disabled ? "line-through" : "unset",
            }}
          >
            <div className="tagContent">{label}</div>
          </StyledTag>
        </Tooltip>
      );
    },
    [filters, boxValues],
  );

  const dropdownLoading = loading && isLastValueEndsWithAnOperator;

  // Handle change in the select input
  const handleChange = (values: string[]) => {
    onChange?.(values);

    // empty
    if (!values[0]) {
      setBoxValues([]);
      return [];
    }

    setSearchValue("");
    const newValue = values.at(-1) || "";
    if (!newValue) return [];

    // remove a tag
    if (values.length < boxValues.length) {
      setBoxValues(values);
      return values;
    }

    // group Filter's items to a tag
    const isNewValueAOperator = operatorValues.includes(newValue);

    const isInGroup = isLastValueAFilterKey || isLastValueEndsWithAnOperator;
    if (isInGroup) {
      let newLastValue = `${lastValue}${newValue}`;

      if (isLastValueEndsWithAnOperator) {
        // prevent string that contains operators after an operator
        if (
          operatorValues.find((operatorVal) => newValue.includes(operatorVal))
        ) {
          return [];
        }
      }

      if (isLastValueAFilterKey) {
        // if operator not included, add first operator of the filter as default
        if (!isNewValueAOperator) {
          newLastValue = getSelectValue({
            filterKey: lastValue,
            operatorKey: operatorValues[0],
            value: newValue,
          });
        }
      }

      const newValues = [...boxValues];
      newValues[newValues.length - 1] = newLastValue;
      setOptions([]);
      setBoxValues(newValues);
      return newValues;
    }

    // new Filter key
    if (filterValues.includes(newValue)) {
      // check if the Filter exists
      const isFilterKeyExist = boxValues.find((value) =>
        value.startsWith(newValue),
      );
      if (!isFilterKeyExist) {
        const newValues = [...values];

        // if the Filter has only 1 Operator, attach the Operator too
        const filterOperator =
          filters.find((filter) => filter.value.startsWith(newValue))
            ?.operators || [];
        if (filterOperator.length === 1) {
          newValues[newValues.length - 1] += filterOperator[0].value;
        }

        setOptions([]);
        setBoxValues(newValues);
        return newValues;
      }
    }

    // prevent new Search text contains an operator
    if (operatorValues.find((operatorVal) => newValue.includes(operatorVal))) {
      return boxValues;
    }

    // add new Search text
    const queryFilterIndex = boxValues.findIndex((value) =>
      value.startsWith(defaultFilterKeyState),
    );

    if (queryFilterIndex > -1) {
      // merge Search text and move the Search filter to last index
      const newBoxValues = [...boxValues];
      newBoxValues.splice(queryFilterIndex, 1);
      newBoxValues.push(`${boxValues[queryFilterIndex]} ${newValue}`);

      setBoxValues(newBoxValues);
      return newBoxValues;
    }

    // add the Search filter
    const defaultOperatorOfQueryFilter = filters.find(
      (filter) => filter.value === defaultFilterKeyState,
    )?.operators?.[0]?.value;

    const rs = boxValues.concat(
      `${defaultFilterKeyState}${defaultOperatorOfQueryFilter}${newValue}`,
    );
    setBoxValues(rs);
    return rs;
  };

  useEffect(() => {
    isLastValueEndsWithAnOperatorCallbackState = isLastValueEndsWithAnOperator;
  }, [isLastValueEndsWithAnOperator]);

  // Memoize options for better performance
  useEffect(() => {
    // call typeahead API
    const fetchTypeaheadOptions = async () => {
      try {
        setLoading(true);
        const rs =
          (await lastFilter?.typeaheadCallback?.(debouncedSearchText)) || [];
        setLoading(false);

        if (isLastValueEndsWithAnOperatorCallbackState) {
          setOptions(rs);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    try {
      // after an Operator
      if (lastFilterOperatorValue && lastFilter) {
        // call typeahead API
        fetchTypeaheadOptions();
        return;
      }

      // after a Filter key
      if (lastFilter) {
        setOptions(lastFilter.operators || []);
        return;
      }

      // blank or new Filter
      setOptions(filterOptions);
    } catch (error) {
      setOptions([]);
    }
  }, [
    lastFilter,
    debouncedSearchText,
    filterOptions,
    lastFilterOperatorValue,
    isLastValueEndsWithAnOperator,
  ]);

  // Handle change while typing in the select input
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // auto group filter when a operator matched
    if (operatorValues.includes(value)) {
      selectRef.current?.blur();
      setTimeout(() => selectRef.current.focus(), 100);
    }

    // check if input after an Operator
    if (isLastValueEndsWithAnOperator) {
      setDebouncedSearchText(value);
    }
  };

  // add new value when blur
  const handleBlur = (e: React.FocusEvent<HTMLElement, Element>) => {
    onBlur?.(e);

    if (!searchValue) return;

    handleChange(boxValues.concat(searchValue));
    setSearchValue("");
  };

  const handleSubmit = () => {
    if (!boxValues.length && !searchValue) return;

    let outputBoxValues = [...boxValues];

    // get new values before submitting
    if (searchValue) {
      outputBoxValues = handleChange(boxValues.concat(searchValue));
    }

    // map output search object
    const searchObj = mapBoxValuesToSelectValue(outputBoxValues);
    if (!searchObj.length) return;

    onSubmit?.(searchObj);

    // clear search input
    setSearchValue("");
    selectRef.current.blur();

    if (clearAfterSearch) setBoxValues([]);
  };

  // navigate to Search Result page when press Enter
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onInputKeyDown?.(e);

    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <StyledSelect style={{ width, height }}>
      <span className="prefixIcon">{prefixIcon}</span>
      <Select
        ref={selectRef}
        className="selectInput"
        mode="multiple"
        options={[
          ...(dropdownLoading
            ? [
                {
                  value: "loading",
                  label: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Spin size="small" />
                    </div>
                  ),
                } as DefaultOptionType,
              ]
            : []),
          ...options
            .filter((option1) => !option1.hidden?.(boxValues))
            .map((option2) => {
              const disabled = option2.disabled?.(boxValues);

              return {
                value: option2.value,
                label: option2.optionRender?.(option2) || (
                  <Tooltip
                    {...option2.disableTooltip}
                    title={disabled ? option2.disableTooltip?.title : undefined}
                  >
                    <StyledOption className={`${disabled ? "disabled" : ""}`}>
                      <div className="leftSide">
                        {option2.icon}
                        {option2.name}
                      </div>
                      <div className="rightSide">{option2.subText}</div>
                    </StyledOption>
                  </Tooltip>
                ),
                disabled,
              } as DefaultOptionType;
            }),
        ]}
        value={boxValues}
        onChange={handleChange}
        onInputKeyDown={handleInputKeyDown}
        onSearch={handleSearchChange}
        onBlur={handleBlur}
        tokenSeparators={[":"]}
        loading={dropdownLoading}
        tagRender={tagRender}
        filterOption={false}
        defaultActiveFirstOption={false}
        notFoundContent={searchValue && <>Search for this text</>}
        optionLabelProp="value"
        suffixIcon={null}
        placeholder="Search for items..."
        allowClear
        {...rest}
      />
    </StyledSelect>
  );
};

export default StructuredSearch;
