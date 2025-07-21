/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import * as s from './style';

function InputTableBox({ parameters, inputData, setInputData, inputDatas, isSuccess, serverId }) {

    const handleInputDataOnChange = (e) => {
        setInputData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div css={s.layout}>
            {
                serverId === 1 &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                Object.keys(inputDatas[0] || {})?.map(key => (
                                    <th key={key}>{key}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inputDatas?.map((row, idx) => (
                                <tr key={idx}>
                                    {
                                        Object.keys(inputDatas[0] || {})?.map(key => (
                                            <td key={key}>{row[key]}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
            {
                serverId === 2  &&
                <table css={s.tableStyle}>
                    <tbody>
                        {
                            parameters?.map(param => (
                                <tr key={param.key}>
                                    <th>{param?.name}</th>
                                    <td><input name={param?.key} type='text' value={inputData[param?.key]} onChange={handleInputDataOnChange} autoFocus={true}/></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default InputTableBox;