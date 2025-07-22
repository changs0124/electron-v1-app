/** @jsxImportSource @emotion/react */
import { BlockMath } from 'react-katex';
import * as s from './style';
import { IoIosArrowForward, IoIosFolder, IoIosFolderOpen, IoMdDownload } from "react-icons/io";
import { useEffect, useState } from 'react';
import InputTableBox from '../tableBox/InputTableBox/InputTableBox';
import OutputTableBox from '../tableBox/OutputTableBox/OutputTableBox';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { tabIdAtom, tabsAtom, tabServerIdAtom } from '../../atoms/tabAtoms';
import { useMutation, useQuery } from '@tanstack/react-query';
import { inputInstance, instance } from '../../apis/instance';
import { graphInfoAtom, indexAtom, inputDataAtom, inputDatasAtom, outPutDatasAtom, pollingCountAtom, serverInfoAtom } from '../../atoms/dataAtoms';
import { ROM_EXE_CONSTANTS, ROM_PINN_EXE_CONSTANTS } from '../../constants/ExeConstants';
import { exeStatusAtom, inputStatusAtom, pollingStatusAtom } from '../../atoms/statusAtoms';

function InOutPutBox() {
    const [isRpHovered, setIsRpHovered] = useState(false); // useState 호출 뒤에 세미콜론

    const tabs = useRecoilValue(tabsAtom); // useRecoilValue 호출 뒤에 세미콜론
    const tabId = useRecoilValue(tabIdAtom); // useRecoilValue 호출 뒤에 세미콜론
    const serverId = useRecoilValue(tabServerIdAtom(tabId)); // useRecoilValue 호출 뒤에 세미콜론

    const setGraphInfo = useSetRecoilState(graphInfoAtom(tabId)); // useSetRecoilState 호출 뒤에 세미콜론

    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론

    const [inputData, setInputData] = useRecoilState(inputDataAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론
    const [inputDatas, setInputDatas] = useRecoilState(inputDatasAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론
    const [outputDatas, setOutputDatas] = useRecoilState(outPutDatasAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론

    const [index, setIndex] = useRecoilState(indexAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론

    const [inputStatus, setInputSattus] = useRecoilState(inputStatusAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론
    const [exeStatus, setExeStatus] = useRecoilState(exeStatusAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론
    const [pollingStatus, setPollingStatus] = useRecoilState(pollingStatusAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론
    const [pollingCount, setPollingCount] = useRecoilState(pollingCountAtom(tabId)); // useRecoilState 호출 뒤에 세미콜론

    const info = useQuery({
        queryKey: ['info', serverInfo],
        queryFn: () => instance(serverInfo?.port).get(`/info/${serverInfo?.id}`).then(res => res?.data),
        enabled: serverInfo?.id !== '' && !!serverInfo?.port,
        retry: false,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchInterval: pollingStatus ? false : 5000
    }); // useQuery 호출 뒤에 세미콜론

    const input = useQuery({
        queryKey: ["input", index],
        queryFn: () => inputInstance.get(`/input/${index}`)
            .then(res => {
                predictTemp.mutateAsync(res?.data); // 실행문 뒤에 세미콜론
                return res?.data; // return 문 뒤에 세미콜론
            })
            .catch(err => {
                window.electronAPI.showAlert('There is no data to retrieve.'); // 실행문 뒤에 세미콜론
                setIndex(1); // 실행문 뒤에 세미콜론
                return err; // return 문 뒤에 세미콜론
            }),
        enabled: inputStatus,
        refetchOnWindowFocus: false,
        retry: 0
    }); // useQuery 호출 뒤에 세미콜론

    const predictSOC = useMutation({
        mutationFn: () => instance(serverInfo?.port).post('/predict', inputData),
        onSuccess: async (res) => {
            setOutputDatas(prev => [...prev, res?.data]); // 실행문 뒤에 세미콜론
            await window.electronAPI.showAlert('Prediction success'); // await 표현식 뒤에 세미콜론
        },
        onError: async (err) => {
            await window.electronAPI.showAlert(`Prediction failed: ${err?.message || 'Unknown error'}`); // await 표현식 뒤에 세미콜론
        }
    }); // useMutation 호출 뒤에 세미콜론

    const predictTemp = useMutation({
        mutationFn: (data) => instance(serverInfo?.port).post('/predict', data),
        onSuccess: async (res, variables) => {
            setInputDatas(prev => [...prev, variables]); // 실행문 뒤에 세미콜론
            setOutputDatas(prev => [...prev, res?.data]); // 실행문 뒤에 세미콜론

            await new Promise(resolve => setTimeout(resolve, 3000)); // await 표현식 뒤에 세미콜론
            setIndex(prev => prev + 1); // 실행문 뒤에 세미콜론
        },
        onError: async () => {
            setInputSattus(false); // 실행문 뒤에 세미콜론
            await window.electronAPI.showAlert('An error occurred while processing data.'); // await 표현식 뒤에 세미콜론
        }
    }); // useMutation 호출 뒤에 세미콜론

    useEffect(() => {
        if (info.isError) {
            setExeStatus(true); // 실행문 뒤에 세미콜론
            setPollingCount(prev => prev + 1); // 실행문 뒤에 세미콜론
            return; // return 문 뒤에 세미콜론
        }

        if (info.isFetching) {
            setExeStatus(true); // 실행문 뒤에 세미콜론
            return; // return 문 뒤에 세미콜론
        }

        if (info.isSuccess) {
            setPollingStatus(true); // 실행문 뒤에 세미콜론
            setExeStatus(false); // 실행문 뒤에 세미콜론
            setGraphInfo(info?.data?.graph); // 실행문 뒤에 세미콜론
            setPollingCount(0); // 실행문 뒤에 세미콜론
            return; // return 문 뒤에 세미콜론
        }

    }, [info.isFetching, info.isError, info.isSuccess]); // useEffect 호출 뒤에 세미콜론

    useEffect(() => {
        if (pollingCount > 10) {
            window.electronAPI.showAlert('Exe execution failed'); // 실행문 뒤에 세미콜론
            setPollingStatus(true); // 실행문 뒤에 세미콜론
            setExeStatus(false); // 실행문 뒤에 세미콜론
            setPollingCount(0); // 실행문 뒤에 세미콜론
            setServerInfo({}); // 실행문 뒤에 세미콜론
            return; // return 문 뒤에 세미콜론
        }

    }, [pollingCount]); // useEffect 호출 뒤에 세미콜론

    const handleSelectServerOnClick = async () => {
        if (serverId === 1) {
            const res = await window.electronAPI.selectServer(ROM_EXE_CONSTANTS); // await 표현식 뒤에 세미콜론

            if (res.success) {
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                }); // 객체 리터럴이 포함된 실행문 뒤에 세미콜론
            } else if (res?.error === 'The server is already running.') {
                await window.electronAPI.showAlert(res?.error); // await 표현식 뒤에 세미콜론
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                }); // 객체 리터럴이 포함된 실행문 뒤에 세미콜론
            } else {
                await window.electronAPI.showAlert(`${res?.error}`); // await 표현식 뒤에 세미콜론
            }; // if/else 블록의 마지막이지만, 문장 전체의 끝이므로 세미콜론
        }; // if 블록의 마지막이지만, 문장 전체의 끝이므로 세미콜론

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
                                <p>{(info.isSuccess && !exeStatus) ? info?.data?.equation : 'Please Select the .exe'}</p>
                                {
                                    info.isSuccess &&
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
                        <InputTableBox parameters={info?.data?.parameters} inputData={inputData} setInputData={setInputData} inputDatas={inputDatas} isSuccess={info.isSuccess} serverId={serverId} />
                    </div>
                    <div css={s.svgBox} onClick={serverId === 2 ? () => predictSOC.mutateAsync().catch(() => { }) : () => { }}>
                        <IoIosArrowForward />
                    </div>
                    <div css={s.outputContainer}>
                        <div css={s.titleBox}>
                            <p>DATA TABLE</p>
                            <div css={s.iconBox} onClick={handleSaveCSVOnClick}><IoMdDownload /></div>
                        </div>
                        <OutputTableBox outputDatas={outputDatas} isSuccess={info.isSuccess} />
                    </div>
                </div>
            }
        </>
    );
}

export default InOutPutBox;