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
      .ant-select-selection-overflow {
        padding-left: 35px;
      }
      .ant-select-selection-placeholder {
        padding-left: ${35 - 4}px;
      }

      .ant-select-selection-search {
        margin-left: 4px;
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
    gap: 12px;

    :where(.anticon) {
      display: flex;
      align-items: center;
    }
  }

  .rightSide {
    color: rgba(0, 0, 0, 0.45);
  }
`;

const StyledTag = styled(Tag)`
  font-size: 14px;
  padding: 3px 7px;
`;

export { StyledSelect, StyledOption, StyledTag };
