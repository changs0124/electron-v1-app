/** @jsxImportSource @emotion/react */
import { BlockMath } from 'react-katex';
import * as s from './style';
import { IoIosArrowForward, IoIosFolder, IoIosFolderOpen, IoMdDownload } from "react-icons/io";
import { useEffect, useState } from 'react';
import InputTableBox from '../tableBox/InputTableBox/InputTableBox';
import OutputTableBox from '../tableBox/OutputTableBox/OutputTableBox';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { tabIdAtom, tabsAtom, tabServerIdAtom } from '../../atoms/tabAtoms';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { graphInfoAtom, indexAtom, inputDataAtom, inputDatasAtom, outPutDatasAtom, pollingCountAtom, serverInfoAtom, warningDatasAtom } from '../../atoms/dataAtoms';
import { ROM_EXE_CONSTANTS, ROM_PINN_EXE_CONSTANTS } from '../../constants/ExeConstants';
import { exeStatusAtom, inputStatusAtom, pollingStatusAtom } from '../../atoms/statusAtoms';
import { exeInstance, instance } from '../../apis/instance';
import { toast } from 'react-toastify';

function InOutPutBox() {
    const [isRpHovered, setIsRpHovered] = useState(false);

    const tabs = useRecoilValue(tabsAtom);
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(tabServerIdAtom(tabId));

    const setGraphInfo = useSetRecoilState(graphInfoAtom(tabId));

    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId));

    const [inputData, setInputData] = useRecoilState(inputDataAtom(tabId));
    const [inputDatas, setInputDatas] = useRecoilState(inputDatasAtom(tabId));
    const [outputDatas, setOutputDatas] = useRecoilState(outPutDatasAtom(tabId));
    const [warningDatas, setWarningDatas] = useRecoilState(warningDatasAtom(tabId));

    const [index, setIndex] = useRecoilState(indexAtom(tabId));

    const [inputStatus, setInputSattus] = useRecoilState(inputStatusAtom(tabId));
    const [exeStatus, setExeStatus] = useRecoilState(exeStatusAtom(tabId));
    const [pollingStatus, setPollingStatus] = useRecoilState(pollingStatusAtom(tabId));
    const [pollingCount, setPollingCount] = useRecoilState(pollingCountAtom(tabId));

    const info = useQuery({
        queryKey: ['info', serverInfo],
        queryFn: () => exeInstance(serverInfo?.port).get(`/info/${serverInfo?.id}`).then(res => res?.data),
        enabled: serverInfo?.id !== '' && !!serverInfo?.port,
        retry: false,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchInterval: pollingStatus ? false : 5000
    });

    const input = useQuery({
        queryKey: ["input", index],
        queryFn: () => instance.get(`/input/${index}`)
            .then(res => {
                predictTemp.mutateAsync(res?.data);
                return res?.data;
            })
            .catch(err => {
                window.electronAPI.showAlert('There is no data to retrieve.');
                setIndex(1);
                return err;
            }),
        enabled: inputStatus,
        refetchOnWindowFocus: false,
        retry: 0
    });

    const predictSOC = useMutation({
        mutationFn: () => exeInstance(serverInfo?.port).post('/predict', inputData),
        onSuccess: async (res) => {
            setOutputDatas(prev => [...prev, res?.data]);
            await window.electronAPI.showAlert('Prediction success');
        },
        onError: async (err) => {
            await window.electronAPI.showAlert(`Prediction failed: ${err?.message || 'Unknown error'}`);
        }
    });

    const predictTemp = useMutation({
        mutationFn: (data) => exeInstance(serverInfo?.port).post('/predict', data),
        onSuccess: async (res, variables) => {
            setInputDatas(prev => [...prev, variables]);
            setOutputDatas(prev => [...prev, res?.data]);

            if (res?.data) {
                info?.data?.tableHeader?.forEach(h => {
                    const data = res?.data[h]
                    if (data && data?.temp > data?.limit) {
                        toast.error(`${h}: 온도가 임계값(${data.limit})을 초과했습니다! (${data.temp})`, {
                            position: "top-right", // 알림 위치 (선택 사항)
                            autoClose: 5000, // 5초 후 자동 닫힘 (선택 사항)
                            hideProgressBar: false, // 진행 바 표시 여부 (선택 사항)
                            closeOnClick: true, // 클릭 시 닫힘 여부 (선택 사항)
                            pauseOnHover: true, // 호버 시 일시 정지 여부 (선택 사항)
                            draggable: true, // 드래그 가능 여부 (선택 사항)
                            progress: undefined, // 커스텀 진행 바 (선택 사항)
                        });
                    }
                })
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
            setIndex(prev => prev + 1);
        },
        onError: async () => {
            setInputSattus(false);
            await window.electronAPI.showAlert('An error occurred while processing data.');
        }
    });

    useEffect(() => {
        if (info?.isError) {
            setExeStatus(true);
            setPollingCount(prev => prev + 1);
            return;
        }

        if (info?.isFetching) {
            setExeStatus(true);
            return;
        }

        if (info?.isSuccess) {
            setPollingStatus(true);
            setExeStatus(false);
            setGraphInfo(info?.data?.graph);
            setPollingCount(0);
            return;
        }

    }, [info?.isFetching, info?.isError, info?.isSuccess]);

    useEffect(() => {
        if (pollingCount > 10) {
            window.electronAPI.showAlert('Exe execution failed');
            setPollingStatus(true);
            setExeStatus(false);
            setPollingCount(0);
            setServerInfo({});
            return;
        }

    }, [pollingCount]);

    useEffect(() => {

    }, [])

    const handleSelectServerOnClick = async () => {
        if (serverId === 1) {
            const res = await window.electronAPI.selectServer(ROM_EXE_CONSTANTS);

            if (res.success) {
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else if (res?.error === 'The server is already running.') {
                await window.electronAPI.showAlert(res?.error);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else {
                await window.electronAPI.showAlert(`${res?.error}`);
            };
        };

        if (serverId === 2) {
            const res = await window.electronAPI.selectServer(ROM_PINN_EXE_CONSTANTS);

            if (res.success) {
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else if (res?.error === 'The server is already running.') {
                await window.electronAPI.showAlert(res?.error);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else {
                await window.electronAPI.showAlert(`${res?.error}`);
            }
        }
    }

    const handleSaveCSVOnClick = async () => {
        const res = await window.electronAPI.saveCSV(outputDatas);

        if (res.success) {
            await window.electronAPI.showAlert(`Save completed: ${res.filePath}`);
        } else {
            await window.electronAPI.showAlert(res.error);
        }
    }

    const handleSetInputStatusOnClick = () => {
        setInputSattus(!inputStatus);
    }

    return (
        <>
            {
                !!tabs?.length &&
                <div css={s.layout}>
                    <div css={s.inputContainer}>
                        <div css={s.titleBox}>
                            <p>{!!serverId && serverId === 1 ? 'ROM SERVER' : 'ROM & PINN SERVER'}</p>
                            <div css={s.iconBox} onMouseOver={() => setIsRpHovered(true)} onMouseOut={() => setIsRpHovered(false)} onClick={handleSelectServerOnClick}>{isRpHovered ? <IoIosFolderOpen /> : <IoIosFolder />}</div>
                        </div>
                        {
                            serverId === 1 &&
                            <div css={s.exeBox}>
                                <p>{(info?.isSuccess && !exeStatus) ? info?.data?.equation : 'Please Select the .exe'}</p>
                                {
                                    info?.isSuccess &&
                                    <div css={s.buttonBox}>
                                        <button onClick={handleSetInputStatusOnClick}>{inputStatus ? 'Stop Predict' : 'Get InputDatas And Start Predict'}</button>
                                    </div>
                                }
                            </div>
                        }
                        {
                            serverId === 2 &&
                            <div css={s.katexBox}>
                                <BlockMath math={(info.isSuccess && !exeStatus) ? info?.data?.recursiveEquation : 'Server\\ \\ Not \\ \\ Found'} />
                            </div>
                        }
                        <InputTableBox parameters={info?.data?.parameters} inputData={inputData} setInputData={setInputData} inputDatas={inputDatas} serverId={serverId} />
                    </div>
                    <div css={s.svgBox} onClick={serverId === 2 ? () => predictSOC.mutateAsync().catch(() => { }) : () => { }}>
                        <IoIosArrowForward />
                    </div>
                    <div css={s.outputContainer}>
                        <div css={s.titleBox}>
                            <p>DATA TABLE</p>
                            <div css={s.iconBox} onClick={handleSaveCSVOnClick}><IoMdDownload /></div>
                        </div>
                        <OutputTableBox tableHeader={info?.data?.tableHeader} outputDatas={outputDatas} isSuccess={info.isSuccess} />
                    </div>
                </div>
            }
        </>
    );
}

export default InOutPutBox;