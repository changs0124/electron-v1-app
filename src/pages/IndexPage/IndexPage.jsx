/** @jsxImportSource @emotion/react */
import * as s from './style';
import { useRecoilState, useRecoilValue } from 'recoil';
import Container from '../../components/Container/Container';
import Layout from '../../components/Layout/Layout';
import { serverIdAtom, tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import SideBar from '../../components/SideBar/SideBar';
import TabModal from '../../components/TabModal/TabModal';
import Loading from '../../components/Loading/Loading';
import { tabStatusAtom } from '../../atoms/statusAtoms';
import { ToastContainer } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serverInfoAtom } from '../../atoms/dataAtoms';
import { exeInstance } from '../../apis/instance';
import { useEffect, useState } from 'react';
import InputBox from '../../components/InputBox/InputBox';
import SvgBox from '../../components/SvgBox/SvgBox';
import OutputBox from '../../components/OutputBox/OutputBox';
import GraphBox from '../../components/GraphBox/GraphBox';
import ViewerBox from '../../components/ViewerBox/ViewerBox';

function IndexPage() {
    const queryClient = useQueryClient();

    const tabs = useRecoilValue(tabsAtom);
    const tabId = useRecoilValue(tabIdAtom);
    const tabStatus = useRecoilValue(tabStatusAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId));
    const [isQueryEnabled, setIsQueryEnabled] = useState(true);
    
    const info = useQuery({
        queryKey: ['info', serverInfo],
        queryFn: () => exeInstance(serverInfo?.port).get(`/info/${serverInfo?.id}`).then(res => res?.data),
        enabled: serverInfo?.id !== '' && !!serverInfo?.port,
        retry: false,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: true,
        refetchInterval: isQueryEnabled ? 5000 : false
    });

    useEffect(() => {
        if (info?.isError && info?.errorUpdateCount > 9) {
            window.electronAPI.showAlert('Exe execution failed');
            setIsQueryEnabled(false);
            setServerInfo({
                id: '',
                port: 0
            });
            queryClient.removeQueries({queryKey: ['info', serverInfo]})
            return;
        }

        if (info?.isPending || (info?.isError && info?.errorUpdateCount <= 9)) {
            setIsQueryEnabled(true);
            return;
        }

        if (info?.isSuccess) {
            setIsQueryEnabled(false);
        }

    }, [info?.isPending, info?.isError, info?.errorUpdateCount, info?.isSuccess]);

    return (
        <Layout>
            <ToastContainer />
            {
                tabStatus &&
                <TabModal />
            }
            {
                (info?.isPending || info?.isError) && (serverInfo?.id !== '' && !!serverInfo?.port) &&
                <Loading />
            }
            <SideBar />
            <Container>
                {
                    !!tabs?.length &&
                    <>
                        <div css={s.layout}>
                            <InputBox info={info} />
                            <SvgBox />
                            <OutputBox info={info} />
                        </div>
                        <div css={s.layout}>
                            <GraphBox graphInfo={info?.data?.graph} />
                            {
                                serverId === 1 &&
                                <ViewerBox info={info}/>
                            }
                        </div>
                    </>

                }
            </Container>
        </Layout>
    );
}

export default IndexPage;