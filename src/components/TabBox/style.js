import { css } from "@emotion/react";

export const layout = (value, tabId) => css`
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    width: 100%;
    min-height: 100px;
    cursor: pointer;
    background-color: ${value === tabId ? "#666666" : 'transparent'};

    :hover {
        border: 2px solid #666666;
    }
`;

export const deleteBox = (value, tabId) => css`
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    height: fit-content;

    & > svg {
        color: ${value === tabId ? "#ffffff" : '#666666'};
        font-size: 35px;

        :hover {
            color: ${value === tabId ? "#ffffff" : '#333333'};
        }

        :active {
            color: ${value === tabId ? "#ffffff" : '#000000'};
        }
    }
`;

export const titleBox = (value, tabId) => css`
    box-sizing: border-box;
    display: flex;
    color:  ${value === tabId ? "#ffffff" : '#333333'};
    font-size: 23px;
    font-weight: 600;
    cursor: pointer;
`;