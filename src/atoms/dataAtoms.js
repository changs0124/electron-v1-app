import { atomFamily } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

// ROM & PINN - inputData
export const inputDataAtom = atomFamily({
    key: 'inputDataAtom',
    default: {},
    effects_UNSTABLE: [persistAtom]
})

// ROM - inputDatas(DB에서 가지고 온 데이터 리스트)
export const inputDatasAtom = atomFamily({
    key: 'inputDatasAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
})

// ROM, ROM & PINN - outputDatas
export const outPutDatasAtom = atomFamily({
    key: 'outPutDatasAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
})

// .exe의 id, port
export const serverInfoAtom = atomFamily({
    key: 'serverInfoAtom',
    default: {
        id: '',
        port: 0
    },
    effects_UNSTABLE: [persistAtom]
})

// reactQuery - input 하나씩 다음 거를 가지고 오기 위한 인덱스
export const indexAtom = atomFamily({
    key: 'indexAtom',
    default: 1,
    effects_UNSTABLE: [persistAtom]
})

// Coil-Stl
export const selectedCoilStlAtom = atomFamily({
    key: 'selectedCoilStlAtom',
    default: {},
    effects_UNSTABLE: [persistAtom]
})

// Coil-Stl > Buffer
export const coilUrlAtom = atomFamily({
    key: 'coilUrlAtom',
    default: "",
    effects_UNSTABLE: [persistAtom]
})

// Core-Stl
export const selectedCoreStlAtom = atomFamily({
    key: 'selectedCoreStlAtom',
    default: {},
    effects_UNSTABLE: [persistAtom]
})

// Core-Stl > Buffer
export const coreUrlAtom = atomFamily({
    key: 'coreUrlAtom',
    default: "",
    effects_UNSTABLE: [persistAtom]
})