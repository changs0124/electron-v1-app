import { atom, atomFamily } from "recoil";

// 해당 사용자의 LicenseKey값의 따른 컴포넌트 렌더링을 위한 Status 
export const licenseStatusAtom = atom({
    key: 'licenseStatusAtom',
    default: false
})

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

// .exe 실행 시 상태에 따라 Loading 컴포넌트를 화면에 노출할지에 대한 Status
export const exeStatusAtom = atomFamily({
    key: 'exeStatusAtom',
    default: false
})

// useQuery['info']의 refetchInterval을 유무에 대한 Status
export const pollingStatusAtom = atomFamily({
    key: 'pollingStatusAtom',
    default: false
})

// 예측값이 limit값을 넘었을 시에 경고 알람을 위한 Status
export const limitStatusAtom = atomFamily({
    key: 'limitStatusAtom',
    default: false
})