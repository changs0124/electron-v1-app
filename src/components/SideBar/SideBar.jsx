/** @jsxImportSource @emotion/react */
import * as s from './style';
import TabBox from '../TabBox/TabBox';
import { IoIosAdd } from "react-icons/io";
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { tabsAtom } from '../../atoms/tabAtoms';
import { tabStatusAtom } from '../../atoms/statusAtoms';

function SideBar() {
    const tabs = useRecoilValue(tabsAtom);

    const setTabStatus = useSetRecoilState(tabStatusAtom);

    return (
        <div css={s.layout}>
            <div css={s.addBox} onClick={() => setTabStatus(true)}>
                <IoIosAdd />
            </div>
            <div css={s.container}>
                {
                    !!tabs?.length && tabs?.map(tab => (
                        <TabBox key={tab?.id} tab={tab} />
                    ))
                }
            </div>
        </div>
    );
}

export default SideBar;