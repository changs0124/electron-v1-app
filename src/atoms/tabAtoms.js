import { atom, atomFamily } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const tabIdAtom = atom({
    key: "tabIdAtom",
    default: "",
    effects_UNSTABLE: [persistAtom]
});

export const tabsAtom = atom({
    key: "tabsAtom",
    default: [],
    effects_UNSTABLE: [persistAtom]
});

export const tabServerIdAtom = atomFamily({
    key: 'tabServerIdAtom',
    default: 0,
    effects_UNSTABLE: [persistAtom]
});

