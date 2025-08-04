import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    border-radius: 15px;
    width: 50%;
    height: 30%;
    background-color: #ffffff;
`;

export const titleBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    padding: 10px;
    width: 100%;
    height: 20%;

    & > p {
        color: #333333;
        font-size: 20px;
        font-weight: 600;
    }
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    padding: 50px 0px;
    width: 100%;
`;

export const inputBox = css`
    box-sizing: border-box;
    display: flex;
    width: 90%;
    cursor: pointer;

    & > input {
        border-bottom: 2px solid #dbdbdb;
        padding: 5px 10px;
        width: 100%;
        color: #333333;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        cursor: pointer;

        :focus {
            border-bottom: 2px solid #EF5B25;
        }
    }
`;

export const buttonBox = css`
    box-sizing: border-box;
    display: flex;
    width: 20%;

    & > button {
        border-radius: 15px;
        width: 100%;
        font-size: 20px;
        color: #ffffff;
        background-color: #EF5B25;
    }
`;