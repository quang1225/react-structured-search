import styled from "@emotion/styled";
import { Tag } from "antd";

const StyledSelect = styled.div`
  display: flex;
  position: relative;

  .prefixIcon {
    display: flex;
    position: absolute;
    z-index: 5;
    color: rgba(0, 0, 0, 0.25);
    font-size: 18px;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .selectInput {
    width: 100%;
    height: 100%;

    &:hover {
      .ant-select-selector {
        border-color: #00b14f !important;
      }
    }

    &.ant-select-focused {
      .ant-select-selector {
        border-color: #00b14f !important;
      }
    }

    .ant-select-selector {
      padding-left: 36px;

      .ant-select-selection-placeholder {
        padding-left: ${35 - 4}px;
      }

      .ant-select-selection-search {
        margin-left: 4px;
      }
    }

    .ant-select-selection-overflow {
      overflow-x: auto;
      overflow-y: hidden;
      flex-wrap: unset;
      padding-bottom: 6px;
      padding-top: 3px;

      .ant-select-selection-overflow-item,
      .ant-select-selection-overflow-item-suffix {
        height: 30px;
      }

      ::-webkit-scrollbar {
        height: 5px;
        width: 4px;
        background: transparent;
      }

      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 12px;
      }

      ::-webkit-scrollbar-thumb {
        background: lightgray;
        cursor: initial;
        border-radius: 12px;

        :hover {
          background: gray;
        }
      }
    }

    /* .selectDropdown {
      :where(.ant-select-dropdown-menu-item) {
        padding: 9px 12px !important;
      }

      :where(.ant-select-selected-icon) {
        display: none !important;
      }
    } */
  }
`;

const StyledOption = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;

  &.disabled {
    cursor: not-allowed;
    user-select: none;

    .rightSide {
      color: rgba(0, 0, 0, 0.25);
    }
  }

  .leftSide {
    display: flex;
    align-items: center;
    gap: 12px;

    :where(.duxicon) {
      display: flex;
      align-items: center;
    }
  }

  .rightSide {
    color: rgba(0, 0, 0, 0.45);
  }
`;

const StyledTag = styled(Tag)`
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 7px;

  span {
    margin-inline-start: 0px !important;
  }

  .tagContent {
    margin-left: 6px;
    margin-right: 10px;
  }
`;

export { StyledSelect, StyledOption, StyledTag };
