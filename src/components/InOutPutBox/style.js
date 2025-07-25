import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: 49.5%;
`;

export const titleBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    padding-left: 10px;
    padding-bottom: 5px;
    width: 100%;
    min-height: 10%;

    & > p {
        color: #333333;
        font-size: 20px;
        font-weight: 600;
    }
`;

export const iconBox = css`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: fit-content;
    height: fit-content;
    cursor: pointer;

    & > svg {
        color: #666666;
        font-size: 30px;

        :hover {
            color: #333333;
        }

        :active {
            color: #000000;
        }
    }
`;

export const inputContainer = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 3px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    width: 55%;
    height: 100%;
`;

export const exeBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    width: 100%;
    min-height: 30%;

    & > p {
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        line-height: 25px;
        white-space: pre-line;
    }
`;

export const buttonBox = css`
    box-sizing: border-box;
    display: flex;
    margin-bottom: 10px;
    width: 40%;

    & > button {
        border: 2px solid #666666;
        border-radius: 15px;
        width: 100%;
        color: #666666;
        font-size: 18px;
        font-weight: 600;

        :hover {
            border: 2px solid #333333;
            color: #333333;
        }

        :active {
            border: 2px solid #000000;
            color: #000000;
        }
    }
`;

export const katexBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    padding: 25px 0px;
    width: 100%;
    min-height: 50%;

    & .katex-mathml {
        font-size: 30px;
    }

    & .katex-html {
        display: none !important;
    }
`;

export const svgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
    cursor: pointer;

    & > svg {
        color: #666666;
        font-size: 80px;
    }

    :hover {
        & > svg {
            color: #333333;
        }
    }

    :active {
        & > svg {
            color: #000000;
        }
    }
`;

export const outputContainer = css`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    border: 3px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    height: 100%;
`;

