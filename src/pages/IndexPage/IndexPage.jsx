/** @jsxImportSource @emotion/react */
import * as s from './style';
import { useRecoilValue } from 'recoil';
import Container from '../../components/Container/Container';
import Layout from '../../components/Layout/Layout';
import { tabIdAtom, tabsAtom, tabServerIdAtom } from '../../atoms/tabAtoms';
import SideBar from '../../components/SideBar/SideBar';
import TabModal from '../../components/TabModal/TabModal';
import InOutPutBox from '../../components/InOutPutBox/InOutPutBox';
import GraphBox from '../../components/GraphBox/GraphBox';
import ViewerBox from '../../components/ViewerBox/ViewerBox';
import Loading from '../../components/Loading/Loading';
import { exeStatusAtom, tabStatusAtom } from '../../atoms/statusAtoms';
import { ToastContainer } from 'react-toastify';

function IndexPage() {
    const tabStatus = useRecoilValue(tabStatusAtom);
    const tabs = useRecoilValue(tabsAtom);
    const tabId = useRecoilValue(tabIdAtom);

    const serverId = useRecoilValue(tabServerIdAtom(tabId));
    const exeStatus = useRecoilValue(exeStatusAtom(tabId));

    return (
        <Layout>
            <ToastContainer />
            {
                tabStatus &&
                <TabModal />
            }
            {
                exeStatus &&
                <Loading />
            }
            <SideBar />
            <Container>
                <div>
                    
                </div>
                <InOutPutBox />
                <GraphBox />
                {
                    !!tabs?.length && serverId === 1 &&
                    <ViewerBox />
                }
            </Container>
        </Layout>
    );
}

export default IndexPage;