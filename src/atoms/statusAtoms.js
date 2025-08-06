import { atom, atomFamily } from "recoil";

// tab 생성을 위한 tabModal의 Status
export const tabStatusAtom = atom({
    key: 'tabStatusAtom',
    default: false
})

// DB에서 input데이터 요청을 위한 Status
export const inputStatusAtom = atomFamily({
    key: 'inputStatusAtom',
    default: false
})