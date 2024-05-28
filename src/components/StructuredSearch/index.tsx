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
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useDebouncedState from "../../hooks/useDebouncedState";
import {
  StyledSelect,
  StyledOption,
  StyledTag,
  activeOptionStyle,
  activeIconStyle,
} from "./styles";
import {
  mapSelectValueToBoxValues,
  findDeepestGroupFilter,
  findFilterByValue,
  getSelectValue,
  mapBoxValuesToSumitValue,
  convertBoxValueToSearchValue,
  moveGroupFilterKeyToTop,
  isOptionActive,
} from "../../helpers";
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
  operators?: Option[];
  options?: ((searchText: string) => Promise<Option[]> | Option[]) | Option[];
  tagColor?: TagColorProp;
  children?: Filter[];
  hasMultiOptions?: boolean;
};

export type StructuredSearchProps = SelectProps & {
  filters: Filter[];
  onSubmit?: (result: StructuredSearchValue) => void;
  onChange?: (values: string[]) => void;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onInputKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  clearAfterSearch?: boolean;
  width?: number | string;
  height?: number | string;
  prefixIcon?: ReactNode;
  groupIcon?: ReactNode;
  defaultQueryKey?: string;
  value?: StructuredSearchValue;
  defaultValue?: StructuredSearchValue;
};

export type StructuredSearchFilterValue = {
  filterKey?: string;
  operatorKey?: string;
  value?: string;
};

export type StructuredSearchValue = {
  filters: StructuredSearchFilterValue[];
  groupFilterKeys: string[];
};

type TagRender = SelectProps["tagRender"];
export type TagColorProp = TagProps["color"];

const { Option } = Select;

const TYPEAHEAD_DELAY = 400;

const DEFAULT_QUERY_KEY = "keywords";

let isLastValueEndsWithAnOperatorCallbackState = false;
let isMultiOptionState = false;
let isTypeaheadState = false;

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
  groupIcon = <ArrowRightOutlined />,
  defaultQueryKey = DEFAULT_QUERY_KEY,
  value,
  defaultValue,
  onDeselect,
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
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    setBoxValues(mapSelectValueToBoxValues(value));
  }, [value]);

  // Memoize values for better performance
  const { currentFilters, filterValues, currentGroupFilter } = useMemo(() => {
    if (boxValues.length === 0) {
      return {
        currentFilters: filters,
        filterValues: filters.map((filter) => filter.value),
      };
    }

    let tempCurrentFilters = filters;

    // detect current Group Filter base on selected box values and index of depth of children
    const tempCurrentGroupFilter = findDeepestGroupFilter(filters, boxValues);
    if (tempCurrentGroupFilter?.children) {
      tempCurrentFilters = tempCurrentGroupFilter.children;
    }

    return {
      currentFilters: tempCurrentFilters,
      filterValues: tempCurrentFilters.map((filter) => filter.value),
      currentGroupFilter: tempCurrentGroupFilter,
    };
  }, [boxValues]);

  const { operators, operatorValues } = useMemo(() => {
    const tempOperators = [
      ...new Set(currentFilters.flatMap((filter) => filter.operators || [])),
    ];

    return {
      operators: [
        ...new Set(currentFilters.flatMap((filter) => filter.operators || [])),
      ],
      operatorValues: tempOperators.map((operator) => operator.value),
    };
  }, [currentFilters]);

  // const allFilterKeys = useMemo(() => {
  //   return getAllObjectValues(filters);
  // }, [filters]);

  const {
    lastBoxValue,
    lastFilterKey,
    lastFilterOperatorValue,
    lastFilterValue,
    lastFilter,
    filterOptions,
    isLastValueEndsWithAFilterKey,
    isLastValueEndsWithAnOperator,
    isLastFilterAGroup,
    isLastFilterHasMultiOptions,
  } = useMemo<{
    lastBoxValue: string;
    lastFilterKey: string | undefined;
    lastFilterOperatorValue: string | undefined;
    lastFilterValue: string | undefined;
    lastFilter: Filter | undefined;
    filterOptions: Filter[];
    isLastValueEndsWithAFilterKey: boolean;
    isLastValueEndsWithAnOperator: boolean;
    isLastFilterAGroup: boolean;
    isLastFilterHasMultiOptions: boolean;
  }>(() => {
    const tempLastBoxValue = boxValues.at(-1) || "";
    const {
      filterKey: tempLastFilterKey,
      operatorKey: tempOperatorValue,
      value: tempLastFilterValue,
    } = convertBoxValueToSearchValue(tempLastBoxValue);
    const tempLastFilter = currentFilters.find(
      (filter) => filter.value === tempLastFilterKey,
    );

    return {
      lastBoxValue: tempLastBoxValue,
      lastFilterKey: tempLastFilterKey,
      lastFilterOperatorValue: tempOperatorValue,
      lastFilterValue: tempLastFilterValue,
      lastFilter: currentFilters.find(
        (filter) => filter.value === tempLastFilterKey,
      ),
      filterOptions: currentFilters.filter(
        (filter) => !boxValues.find((value) => value?.startsWith(filter.value)),
      ),
      isLastValueEndsWithAFilterKey: filterValues.includes(tempLastBoxValue),
      isLastValueEndsWithAnOperator: !!operatorValues.find((operatorVal) =>
        tempLastBoxValue.endsWith(operatorVal),
      ),
      isLastFilterAGroup: !!tempLastFilter?.children,
      isLastFilterHasMultiOptions: !!tempLastFilter?.hasMultiOptions,
    };
  }, [boxValues, filterValues, operatorValues]);

  const tagRender: TagRender = useCallback(
    (props: { label: any; value: any; closable: any; onClose: any }) => {
      const { label, value, closable, onClose } = props;

      const { filterKey: currentFilterKey = "" } =
        convertBoxValueToSearchValue(value);
      const currentFilter = findFilterByValue(filters, currentFilterKey);
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
    [currentFilters, currentGroupFilter, boxValues],
  );

  const dropdownLoading =
    loading && (isLastValueEndsWithAnOperator || isMultiOptionState);

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

    if (isLastValueEndsWithAnOperator && isLastFilterHasMultiOptions) {
      isMultiOptionState = true;
    }

    const isInATag =
      !isLastFilterAGroup &&
      (isLastValueEndsWithAFilterKey ||
        isLastValueEndsWithAnOperator ||
        isMultiOptionState);
    if (isInATag) {
      let newLastValue = `${lastBoxValue}${isLastValueEndsWithAnOperator ? "" : ","}${newValue}`;

      // Filter out if boxValue already included recently selected value
      if (lastBoxValue.includes(newValue)) {
        let reg = new RegExp(String.raw`${newValue}\,|\,${newValue}`, "g");
        newLastValue = newLastValue.replace(reg, "");
      }

      if (isLastValueEndsWithAnOperator) {
        // prevent string that contains operators after an operator
        if (
          operatorValues.find((operatorVal) => newValue.includes(operatorVal))
        ) {
          return [];
        }
      }

      // if Operator not included, add first operator of the filter as default
      if (isLastValueEndsWithAFilterKey && !isNewValueAOperator) {
        newLastValue = getSelectValue({
          filterKey: lastBoxValue,
          operatorKey: operatorValues[0],
          value: newValue,
        });
      }

      if (!isMultiOptionState) {
        setCurrentOptions([]);
      }

      const newValues = [...boxValues];
      newValues[newValues.length - 1] = newLastValue;
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

        // if the Filter is not a Group and has only 1 Operator, attach the Operator too
        const currentFilter = findFilterByValue(filters, newValue);
        const filterDefaultOperator = currentFilter?.operators?.[0];
        if (!currentFilter?.children && filterDefaultOperator) {
          newValues[newValues.length - 1] += filterDefaultOperator.value;
        }

        setCurrentOptions([]);
        setBoxValues(newValues);
        return newValues;
      }
    }

    // prevent new Search text contains an operator
    if (operatorValues.find((operatorVal) => newValue.includes(operatorVal))) {
      return boxValues;
    }

    // merge Search text and move the Search filter to last index
    const searchTagIndex = boxValues.findIndex((boxValue) => {
      const { filterKey } = convertBoxValueToSearchValue(boxValue);
      return filterKey === defaultQueryKey;
    });

    if (searchTagIndex > -1) {
      const newBoxValues = [...boxValues];
      newBoxValues.splice(searchTagIndex, 1);
      newBoxValues.push(`${boxValues[searchTagIndex]} ${newValue}`);

      setBoxValues(newBoxValues);
      return newBoxValues;
    }

    // add new Search text
    const rs = boxValues.concat(
      getSelectValue({
        filterKey: defaultQueryKey,
        operatorKey: "=",
        value: newValue,
      }),
    );
    setBoxValues(rs);
    return rs;
  };

  useEffect(() => {
    isLastValueEndsWithAnOperatorCallbackState = isLastValueEndsWithAnOperator;
  }, [isLastValueEndsWithAnOperator]);

  // Memoize currentOptions for better performance
  useEffect(() => {
    // call typeahead API
    const renderPromiseOptions = async () => {
      try {
        setLoading(true);
        const rs = await (typeof lastFilter?.options === "function"
          ? lastFilter.options(debouncedSearchText)
          : []);
        setLoading(false);
        isTypeaheadState = false;

        if (isLastValueEndsWithAnOperatorCallbackState) {
          setCurrentOptions(rs);
        }
      } catch (error) {
        setLoading(false);
        isTypeaheadState = false;
      }
    };

    try {
      // after an Operator ( show Filter's options )
      if (isLastValueEndsWithAnOperator || isMultiOptionState) {
        const options = lastFilter?.options;

        if (typeof options === "function") {
          if (options("") instanceof Promise) {
            // prevent call API when selecting multipe options
            if (!isLastValueEndsWithAnOperator && !isTypeaheadState) return;

            renderPromiseOptions();
          } else {
            setCurrentOptions(options(searchValue) as Option[]);
          }
          return;
        }

        setCurrentOptions((lastFilter?.options as Option[]) || []);
        return;
      }

      // after a Filter key
      if (isLastValueEndsWithAFilterKey && lastFilter) {
        // if the Filter has Children, show them
        if (lastFilter.children) {
          setCurrentOptions(lastFilter.children || []);
          return;
        }

        // show Filter's Operators
        setCurrentOptions(lastFilter.operators || []);
        return;
      }

      // blank or new Filter
      setCurrentOptions(filterOptions);
    } catch (error) {
      setCurrentOptions([]);
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

    if (isLastValueEndsWithAnOperator || isMultiOptionState) {
      isTypeaheadState = true;
      setDebouncedSearchText(value);
    }
  };

  // add new value when blur
  const handleBlur = (e: React.FocusEvent<HTMLElement, Element>) => {
    onBlur?.(e);

    if (isMultiOptionState) {
      e.preventDefault();
      setCurrentOptions(filterOptions);
      isMultiOptionState = false;
    }

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
    const searchObj = mapBoxValuesToSumitValue(outputBoxValues, filters);
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
      e.preventDefault();
      handleSubmit();
    }

    if (e.key === "Tab") {
      if (isMultiOptionState) {
        e.preventDefault();
        setCurrentOptions(filterOptions);
        isMultiOptionState = false;
      }
    }
  };

  const handleRemoveATag = (value: string, option: DefaultOptionType) => {
    isMultiOptionState = false;

    // remove all children filter keys of a Group Filter when removing a group tag
    const removedGroupFilter = findFilterByValue(filters, value);
    if (removedGroupFilter) {
      setBoxValues((prev) => {
        const groupFilterValues =
          removedGroupFilter?.children?.map((filter) => filter.value) || [];
        const newValues = prev.filter(
          (val) =>
            !groupFilterValues.some((filterVals) => val.startsWith(filterVals)),
        );
        return newValues;
      });
      return;
    }

    onDeselect?.(value, option);
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
                  disabled: true,
                } as DefaultOptionType,
              ]
            : []),
          ...currentOptions
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
                      <div
                        className="leftSide"
                        style={
                          isOptionActive(option2, lastFilterValue)
                            ? activeOptionStyle
                            : {}
                        }
                      >
                        {option2.icon}
                        {option2.name}
                      </div>
                      <div className="rightSide">
                        {option2.subText}{" "}
                        {Number(
                          findFilterByValue(filters, option2.value)?.children
                            ?.length,
                        ) > 0 && groupIcon}
                        {isOptionActive(option2, lastFilterValue) && (
                          <CheckCircleOutlined style={activeIconStyle} />
                        )}
                      </div>
                    </StyledOption>
                  </Tooltip>
                ),
                disabled,
              } as DefaultOptionType;
            }),
        ]}
        value={moveGroupFilterKeyToTop(boxValues)}
        onChange={handleChange}
        onInputKeyDown={handleInputKeyDown}
        onSearch={handleSearchChange}
        onBlur={handleBlur}
        onDeselect={handleRemoveATag}
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
