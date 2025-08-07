/** @jsxImportSource @emotion/react */
import * as s from './style';

function InputTableBox({ parameter, serverId, inputData, setInputData, inputDatas }) {

    const handleInputDataOnChange = (e) => {
        setInputData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    return (
        <div css={s.layout}>
            {
                serverId === 1 &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                parameter?.map((param, idx) => (
                                    <th key={idx}>{param?.name}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inputDatas?.map((data, idx) => (
                                <tr key={idx}>
                                    {
                                        parameter?.map((param, idx) => (
                                            <td key={idx}>{data[param?.key]}</td>
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
                            parameter?.map((param, idx) => (
                                <tr key={idx}>
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