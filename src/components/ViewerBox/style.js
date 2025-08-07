import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border: 3px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    width: 34.5%;
    height: 48.5%;
`;

export const titleBox = css`
    box-sizing: border-box;
    display: flex;
    border-bottom: 2px solid #dbdbdb;
    padding-left: 10px;
    padding-bottom: 5px;
    width: 100%;
    height: 10%;
    color: #333333;
    font-size: 20px;
    font-weight: 600;
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`;

export const selectBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    width: 70%;
    height: 30%;
    color: #666666;
    font-size: 25px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;

    :hover {
        border: 2px solid #EF5B25;
        color: #EF5B25;
    }
`;

export const svgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    
    & > svg {
        color: #666666;
        font-size: 60px;
    }
`;

export const infoBox = (data, max) => css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    padding: 5px 10px;
    background-color: #000000b2;

    & > p {
        box-sizing: border-box;
        display: flex;
        color: ${data > max ? '#EF5B25' : '#ffffff'};
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
    }
`;