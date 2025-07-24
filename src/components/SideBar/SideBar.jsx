/** @jsxImportSource @emotion/react */
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TabBox from '../TabBox/TabBox';
import * as s from './style';
import { IoIosAdd } from "react-icons/io";
import { tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import { useEffect } from 'react';
import { tabStatusAtom } from '../../atoms/statusAtoms';

function SideBar() {

    const [tabId, setTabId] = useRecoilState(tabIdAtom);

    const tabs = useRecoilValue(tabsAtom);

    const setTabStatus = useSetRecoilState(tabStatusAtom);

    useEffect(() => {
        if (!tabs?.length) {
            setTabStatus(true)
        }
    }, []);

    useEffect(() => {
        if (tabs?.length > 0) {
            const lastTabId = tabs[tabs?.length - 1].id;
            setTabId(lastTabId);
        } else {
            setTabStatus(true);
        };
    }, [tabs]);

    return (
        <div css={s.layout}>
            <div css={s.addBox} onClick={() => setTabStatus(true)}>
                <IoIosAdd />
            </div>
            <div css={s.container}>
                {
                    tabs.length !== 0 && tabs.map(tab => (
                        <TabBox key={tab?.id} tab={tab} tabId={tabId} setTabId={setTabId} />
                    ))
                }
            </div>

        </div>
    );
}

export default SideBar;