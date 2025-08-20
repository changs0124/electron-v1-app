/** @jsxImportSource @emotion/react */
import * as s from './style';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { IoIosClose } from "react-icons/io";
import { indexAtom, inputDataAtom, inputDatasAtom, outPutDatasAtom, serverInfoAtom } from '../../atoms/dataAtoms';
import { serverIdAtom, tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import { inputStatusAtom, tabStatusAtom } from '../../atoms/statusAtoms';

function TabBox({ tab }) {
    const [tabId, setTabId] = useRecoilState(tabIdAtom);

    const setTabStatus = useSetRecoilState(tabStatusAtom);

    const handleSelectTabOnClick = (data) => {
        setTabId(data?.id);
    }

    const handleDeleteTabOnClick = useRecoilCallback(({ set, reset }) => (data) => {
        reset(inputDataAtom(data?.id));
        reset(inputDatasAtom(data?.id));
        reset(outPutDatasAtom(data?.id));
        reset(serverInfoAtom(data?.id));
        reset(indexAtom(data?.id));
        reset(inputStatusAtom(data?.id));
        reset(serverIdAtom(data?.id));

        set(tabsAtom, prev => {
            const tempTabs = prev.filter(tab => tab?.id !== data?.id);

            if (data?.id === tabId) {
                if (tempTabs?.length > 0) {
                    setTabId(tempTabs[tempTabs?.length - 1].id);
                } else {
                    setTabStatus(true);
                }
            }

            return tempTabs;
        });
    });

    return (
        <div css={s.layout(tab?.id, tabId)} onClick={() => handleSelectTabOnClick(tab)}>
            <div
                css={s.deleteBox(tab?.id, tabId)}
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTabOnClick(tab)
                }}
            >
                <IoIosClose />
            </div>
            <p>{tab?.title}</p>
        </div>
    );
}

export default TabBox;
