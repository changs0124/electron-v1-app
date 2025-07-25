/** @jsxImportSource @emotion/react */
import Plot from 'react-plotly.js';
import * as s from './style';
import { useRecoilValue } from 'recoil';
import { tabIdAtom, tabsAtom, tabServerIdAtom } from '../../atoms/tabAtoms';
import { graphInfoAtom, outPutDatasAtom } from '../../atoms/dataAtoms';
import { useEffect, useState } from 'react';
import { LINE_COLORS_CONSTANTS } from '../../constants/colorConstants';

function GraphBox() {
    const tabId = useRecoilValue(tabIdAtom);
    const tabs = useRecoilValue(tabsAtom);
    const serverId = useRecoilValue(tabServerIdAtom(tabId));

    const graphInfo = useRecoilValue(graphInfoAtom(tabId));
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));

    const [tempPlotData, setTempPlotData] = useState([]);
    const [tempPlotLayout, setTempPlotLayout] = useState({});

    useEffect(() => {
        if (!outputDatas?.length) return;

        let maxYValue = 0;

        const dataKeys = Object.keys(outputDatas[0]);
        const dataIndices = Object.keys(outputDatas).filter(key => !isNaN(Number(key)));

        const xValues = dataIndices?.map(key => Number(key) + 1);

        const plotTraces = dataKeys?.map((keyName, index) => {
            const tempYValues = dataIndices?.map(dataIdx => outputDatas[dataIdx][keyName]);
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
            xaxis: { title: graphInfo?.xTitle },
            yaxis: {
                title: graphInfo?.yTitle,
                range: [0, yAxisMax]
            },
            hovermode: 'closest',
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
        <>
            {
                !!tabs?.length &&
                <div css={s.layout(serverId)}>
                    <p css={s.titleBox}>DATA GRAPH</p>
                    <div css={s.container}>
                        {
                            !!outputDatas?.length &&
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

            }
        </>
    );
}

export default GraphBox;