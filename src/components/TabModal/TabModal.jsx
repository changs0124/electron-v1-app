/** @jsxImportSource @emotion/react */
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import * as s from './style';
import { IoIosClose } from "react-icons/io";
import { serverIdAtom, tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import { v4 as uuidv4 } from 'uuid';
import { tabStatusAtom } from '../../atoms/statusAtoms';

function TabModal() {
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    const handleAddTabOnClick = useRecoilCallback(({ set }) =>
        (serverId) => {
            const id = uuidv4();

            set(tabsAtom, prev => {
                const safePrev = Array.isArray(prev) ? prev : [];

                return [
                    ...safePrev,
                    { id, title: `Tab ${safePrev.length + 1}`, serverId }
                ];
            });
            set(tabIdAtom, id);
            set(serverIdAtom(id), serverId);
            set(tabStatusAtom, false);
        }
    )

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
                    <div css={s.selectItem} onClick={() => handleAddTabOnClick(1)}>ROM</div>
                    <div css={s.selectItem} onClick={() => handleAddTabOnClick(2)}>ROM & PINN</div>
                </div>
            </div>
        </div>
    );
}

export default TabModal;