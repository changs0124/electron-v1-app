import { atom, atomFamily } from "recoil";

export const tabStatusAtom = atom({
    key: 'tabStatusAtom',
    default: false
});

export const inputStatusAtom = atomFamily({
    key: 'inputStatusAtom',
    default: false
});

export const exeStatusAtom = atomFamily({
    key: 'exeStatusAtom',
    default: false
});

export const pollingStatusAtom = atomFamily({
    key: 'pollingStatusAtom',
    default: false
});