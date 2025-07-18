/** @jsxImportSource @emotion/react */
import * as s from './style';

function OutputTableBox({ outputDatas }) {

    return (
        <div css={s.layout}>
            {
                !!outputDatas?.length &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                Object.keys(outputDatas[0] || {}).map(key => (
                                    <th key={key}>{key}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            outputDatas?.map((row, idx) => (
                                <tr key={idx}>
                                    {
                                        Object.keys(outputDatas[0] || {}).map(key => (
                                            <td key={key}>{row[key]}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default OutputTableBox;