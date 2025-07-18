import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 999;
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    width: 50%;
    height: 30%;
    background-color: #ffffff;
`;

export const loaderBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    width: 100%;

    & > p {
        color: #666666;
        font-size: 20px;
        font-weight: 600;
    }
`;