/** @jsxImportSource @emotion/react */
import * as s from './style';
import TabBox from '../TabBox/TabBox';
import { IoIosAdd } from "react-icons/io";
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import { tabStatusAtom } from '../../atoms/statusAtoms';

function SideBar() {
    const tabs = useRecoilValue(tabsAtom);
    
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    const [tabId, setTabId ] = useRecoilState(tabIdAtom);
    
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