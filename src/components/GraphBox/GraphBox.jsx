/** @jsxImportSource @emotion/react */
import * as s from './style';
import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';
import { LINE_COLORS_CONSTANTS } from '../../constants/colorConstants';
import { useRecoilValue } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../atoms/tabAtoms';
import { outPutDatasAtom } from '../../atoms/dataAtoms';

function GraphBox({ graphInfo }) {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));

    const [tempPlotData, setTempPlotData] = useState([]);
    const [tempPlotLayout, setTempPlotLayout] = useState({});

    useEffect(() => {
        if (!outputDatas?.length) {
            setTempPlotData([]);
            setTempPlotLayout({});
            return;
        }

        let maxYValue = 0;

        // 그래프 line의 이름에 쓸 배열 추출
        const dataKeys = Object.keys(outputDatas[0]);

        // X축에 사용할 x좌표를 위해 배열의 각 인덱스를 추출
        const dataIndices = Object.keys(outputDatas).filter(key => !isNaN(Number(key)));
        // 배열의 인덱스에 1을 더해 1부터 시작하는 숫자 시퀀스 만듬
        const xValues = dataIndices?.map(key => Number(key) + 1);

        const plotTraces = dataKeys?.map((keyName, index) => {
            const tempYValues = dataIndices?.map(dataIdx => outputDatas[dataIdx][keyName]?.data);
            const lineColor = LINE_COLORS_CONSTANTS[index % LINE_COLORS_CONSTANTS?.length];

            tempYValues.forEach(v => {
                if (typeof v === 'number' && v > maxYValue) {
                    maxYValue = v;
                }
            })

            return {
                x: xValues,
                y: tempYValues,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: lineColor, size: 8 },
                line: { color: lineColor, width: 3 },
                name: keyName
            };
        });

        const yAxisMax = maxYValue > 0 ? maxYValue * 1.1 : 1;

        const newGraphLayout = {
            title: graphInfo?.title,
            xaxis: {
                title: graphInfo?.xTitle,
                showspikes: true,
                spikemode: 'across',
                spikesnap: 'data', 
                showline: true,
                showgrid: true
            },
            yaxis: {
                title: graphInfo?.yTitle,
                range: [0, yAxisMax]
            },
            hovermode: 'x unified',
            showlegend: true,
            legend: {
                x: 1.02,
                xanchor: 'left',
                y: 1,
            }
        };

        setTempPlotData(plotTraces);
        setTempPlotLayout(newGraphLayout);
    }, [outputDatas]);

    return (
        <div css={s.layout(serverId)}>
            <p css={s.titleBox}>DATA GRAPH</p>
            <div css={s.container}>
                {
                    !!graphInfo &&
                    <Plot

                        data={tempPlotData}
                        layout={tempPlotLayout}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: false }}
                    />
                }
            </div>
        </div>
    );
}

export default GraphBox;