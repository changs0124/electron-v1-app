/** @jsxImportSource @emotion/react */
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import * as s from './style';
import { IoIosClose } from "react-icons/io";
import { tabIdAtom, tabsAtom, tabServerIdAtom } from '../../atoms/tabAtoms';
import { v4 as uuidv4 } from 'uuid';
import { tabStatusAtom } from '../../atoms/statusAtoms';

function TabModal() {

    const addTab = useRecoilCallback(({ set }) =>
        (serverId) => {
            const id = uuidv4();

            set(tabsAtom, prev => [
                ...prev,
                { id, title: `Tab ${prev.length + 1}`, serverId }
            ]);
            set(tabIdAtom, id);
            set(tabServerIdAtom(id), serverId);
            set(tabStatusAtom, false);
        }
    )
    
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    return (
        <div css={s.layout}>
            <div css={s.container}>
                <div css={s.titleBox}>
                    <p>Please click one of the two.</p>
                    <div css={s.svgBox} onClick={() => setTabStatus(false)}>
                        <IoIosClose />
                    </div>
                </div>
                <div css={s.selectBox}>
                    <div css={s.selectItem} onClick={() => addTab(1)}>ROM</div>
                    <div css={s.selectItem} onClick={() => addTab(2)}>ROM & PINN</div>
                </div>
            </div>
        </div>
    );
}

export default TabModal;