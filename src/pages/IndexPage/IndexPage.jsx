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
import { exeStatusAtom, inputModalStatusAtom, tabStatusAtom } from '../../atoms/statusAtoms';

function IndexPage() {
    const tabStatus = useRecoilValue(tabStatusAtom);
    const tabs = useRecoilValue(tabsAtom);
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(tabServerIdAtom(tabId));
    const exeStatus = useRecoilValue(exeStatusAtom(tabId));

    return (
        <Layout>
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