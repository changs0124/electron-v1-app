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
                                tableHeader?.map((header, idx) => (
                                    <th key={idx}>{header}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            outputDatas?.map((data, idx) => (
                                <tr key={idx}>
                                    {
                                        tableHeader?.map((header, idx) => (
                                            <td key={idx} css={s.cusTd(data[header]?.data, data[header]?.limit)}>{data[header]?.data}</td>
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