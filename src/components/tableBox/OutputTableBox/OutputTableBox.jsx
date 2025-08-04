/** @jsxImportSource @emotion/react */
import * as s from './style';

function OutputTableBox({ tableHeader, outputDatas }) {

    return (
        <div css={s.layout}>
            {
                !!outputDatas?.length &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                tableHeader?.map((h, idx) => (
                                    <th key={idx}>{h}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            outputDatas?.map((row, idx) => (
                                <tr key={idx}>
                                    {
                                        tableHeader?.map((h, idx) => (
                                            <td key={idx} css={s.cusTd(row[h]?.temp, row[h]?.limit)}>{row[h]?.temp}</td>
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