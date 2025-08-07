/** @jsxImportSource @emotion/react */
import * as s from './style';
import InputTableBox from '../tableBox/InputTableBox/InputTableBox';
import { BlockMath } from 'react-katex';
import { IoIosFolder } from "react-icons/io";
import { ROM_EXE_CONSTANTS, ROM_PINN_EXE_CONSTANTS } from '../../constants/ExeConstants';
import { useMutation, useQuery } from '@tanstack/react-query';
import { exeInstance, instance } from '../../apis/instance';
import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../atoms/tabAtoms';
import { inputStatusAtom } from '../../atoms/statusAtoms';
import { indexAtom, inputDataAtom, inputDatasAtom, outPutDatasAtom, serverInfoAtom } from '../../atoms/dataAtoms';

function InputBox({ info }) {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId));
    const [index, setIndex] = useRecoilState(indexAtom(tabId));
    const [inputData, setInputData] = useRecoilState(inputDataAtom(tabId));
    const [inputDatas, setInputDatas] = useRecoilState(inputDatasAtom(tabId));
    const [inputStatus, setInputStatus] = useRecoilState(inputStatusAtom(tabId));

    const setOutputDatas = useSetRecoilState(outPutDatasAtom(tabId));

    const input = useQuery({
        queryKey: ["input", index],
        queryFn: () => instance.get(`/data/${index}`)
            .then(res => {
                processTemp.mutateAsync(res?.data);
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

    const processTemp = useMutation({
        mutationFn: (data) => exeInstance(serverInfo?.port).post('/process', data),
        onSuccess: async (res, variables) => {
            setInputDatas(prev => [...prev, variables]);
            setOutputDatas(prev => [...prev, res?.data]);
           
            if (res?.data) {
                info?.data?.tableHeader?.forEach(header => {
                    const data = res?.data[header];

                    if (data && data?.data > data?.limit) {
                        toast.error(`${header} : ${(data.data - data.limit).toFixed(2)} 초과`,
                            {
                                position: "bottom-right", // 알림 위치 (선택 사항)
                                autoClose: 3000, // 5초 후 자동 닫힘 (선택 사항)
                                hideProgressBar: false, // 진행 바 표시 여부 (선택 사항)
                                closeOnClick: true, // 클릭 시 닫힘 여부 (선택 사항)
                                pauseOnHover: true, // 호버 시 일시 정지 여부 (선택 사항)
                                draggable: true, // 드래그 가능 여부 (선택 사항)
                                progress: undefined, // 커스텀 진행 바 (선택 사항)
                            });
                    }
                })
            };

            await new Promise(resolve => setTimeout(resolve, 3000));
            setIndex(prev => prev + 1);
        },
        onError: async () => {
            setInputStatus(false);
            await window.electronAPI.showAlert('An error occurred while processing data.');
        }
    });

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

    const handleSetInputStatusOnClick = () => {
        setInputStatus(!inputStatus);
    }

    return (
        <div css={s.layout}>
            <div css={s.titleBox}>
                <p>{!!serverId && serverId === 1 ? 'ROM SERVER' : 'ROM & PINN SERVER'}</p>
                <div css={s.iconBox} onClick={handleSelectServerOnClick}><IoIosFolder /></div>
            </div>
            {
                serverId === 1 &&
                <div css={s.exeBox}>
                    <p>{info?.isSuccess ? info?.data?.equation : 'Please Select the .exe'}</p>
                    {
                        info?.isSuccess &&
                        <div css={s.buttonBox}>
                            <button onClick={handleSetInputStatusOnClick}>{inputStatus ? 'Stop Processing' : 'Get Data And Start Processing'}</button>
                        </div>
                    }
                </div>
            }
            {
                serverId === 2 &&
                <div css={s.katexBox}>
                    <BlockMath math={info?.isSuccess ? info?.data?.recursiveEquation : 'Server\\ \\ Not \\ \\ Found'} />
                </div>
            }
            <InputTableBox parameter={info?.data?.parameter} inputData={inputData} setInputData={setInputData} inputDatas={inputDatas} serverId={serverId} />
        </div >
    );
}

export default InputBox;