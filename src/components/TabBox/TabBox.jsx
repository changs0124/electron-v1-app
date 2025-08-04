/** @jsxImportSource @emotion/react */
import { useRecoilCallback } from 'recoil';
import * as s from './style';
import { IoIosClose } from "react-icons/io";
import { coilUrlAtom, coreUrlAtom, inputDataAtom, outPutDatasAtom, selectedCoilStlAtom, selectedCoreStlAtom, serverInfoAtom } from '../../atoms/dataAtoms';
import { tabsAtom } from '../../atoms/tabAtoms';

function TabBox({ tab, tabId, setTabId }) {
    
    const handleSelectTabOnClick = (data) => {
        setTabId(data?.id);
    }

    const handleDeleteTabOnClick = useRecoilCallback(({set, reset}) => (data) => {
        reset(inputDataAtom(tabId));
        reset(outPutDatasAtom(tabId));
        reset(selectedCoilStlAtom(tabId));
        reset(coilUrlAtom(tabId));
        reset(selectedCoreStlAtom(tabId));
        reset(coreUrlAtom(tabId));
        reset(serverInfoAtom(tabId));

        set(tabsAtom, prev => prev.filter(tab => tab?.id !== data?.id));
    });

    return (
        <div css={s.layout(tab?.id, tabId)} onClick={() => handleSelectTabOnClick(tab)}>
            <div css={s.deleteBox(tab?.id, tabId)} onClick={() => handleDeleteTabOnClick(tab)}><IoIosClose /></div>
            <p>{tab?.title}</p>
        </div>
    );
}

export default TabBox;
