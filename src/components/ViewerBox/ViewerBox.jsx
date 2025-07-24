/** @jsxImportSource @emotion/react */
import * as s from './style';
import * as THREE from 'three';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useRecoilState, useRecoilValue } from 'recoil';
import { tabIdAtom } from '../../atoms/tabAtoms';
import { coilUrlAtom, coreUrlAtom, selectedCoilStlAtom, selectedCoreStlAtom } from '../../atoms/dataAtoms';
import { IoIosClose } from "react-icons/io";

function getColor(temp, min, max, exaggerateFactor = 2) {
    if (min === 0 || max === 0) {
        return [0.8, 0.8, 0.8];
    }

    if (min !== 0 && min !== 0 && min === max) {
        return [1, 0, 0]; // 그냥 빨강으로 시작
    }

    // 범위 재조정 (대비 강조용)
    const center = (min + max) / 2;
    const effectiveMin = center - (center - min) / exaggerateFactor;
    const effectiveMax = center + (max - center) / exaggerateFactor;

    // 온도값 클램핑 및 정규화
    const clamped = Math.max(effectiveMin, Math.min(temp, effectiveMax));
    const normalized = (clamped - effectiveMin) / (effectiveMax - effectiveMin);

    // HSL → RGB 변환
    const h = (1 - normalized) * 0.6; // 0 = red, 0.6 = blue 영역
    const s = 1.0;
    const l = 0.5;

    const color = new THREE.Color();
    color.setHSL(h, s, l);

    return [color.r, color.g, color.b]; // RGB 배열 반환 (0~1 범위)
}

function STLModel({ url, temp, min, max }) {
    const geometry = useLoader(STLLoader, url);
    const tempGeo = geometry.center();
    const ref = useRef();
    const meshRef = useRef();

    useEffect(() => {
        const rgb = getColor(temp, min, max);

        if (ref.current) {
            ref.current.color.set(...rgb); // set(r, g, b)
        }
    }, [temp, min, max]);

    return (
        <mesh ref={meshRef} geometry={tempGeo} scale={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial
                ref={ref}
                polygonOffset
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
            />
        </mesh>
    );
}

function ViewerBox({ coilTemp, minCoil, maxCoil, coreTemp, minCore, maxCore }) {

    const tabId = useRecoilValue(tabIdAtom);

    const [selectedCoilStl, setSelectedCoilStl] = useRecoilState(selectedCoilStlAtom(tabId));
    const [coilUrl, setCoilUrl] = useRecoilState(coilUrlAtom(tabId));
    const [selectedCoreStl, setSelectedCoreStl] = useRecoilState(selectedCoreStlAtom(tabId));
    const [coreUrl, setCoreUrl] = useRecoilState(coreUrlAtom(tabId));

    useEffect(() => {
        if (selectedCoilStl?.success) {
            const getStlUrl = async () => {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoilStl?.filePath);
                const blob = new Blob([fileBuffer], { type: "model/stl" });
                setCoilUrl(URL.createObjectURL(blob));
            }

            getStlUrl();
        }
    }, [selectedCoilStl]);

    useEffect(() => {
        if (selectedCoreStl?.success) {
            const getStlUrl = async () => {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoreStl?.filePath);
                const blob = new Blob([fileBuffer], { type: "model/stl" });
                setCoreUrl(URL.createObjectURL(blob));
            }

            getStlUrl();
        }
    }, [selectedCoreStl])


    const handleSelectStlOnClick = async (set) => {
        const res = await window.electronAPI.selectStl();
        
        if (res.success) {
            set(res)
        } else {
            window.electronAPI.showAlert(res?.error);
        };
    }

    return (
        <div css={s.layout}>
            <p css={s.titleBox}>VIEWER</p>
            <div css={s.container}>
                {
                    (coilUrl === "" || coreUrl === "")
                        ?
                        <>
                            <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoilStl)}>{selectedCoilStl?.fileName || 'COIL'}</div>
                            <div css={s.svgBox}>
                                <IoIosClose />
                            </div>
                            <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoreStl)}>{selectedCoreStl?.fileName || 'CORE'}</div>
                        </>
                        :
                        <Canvas shadows camera={{ position: [0, 0, 100], fov: 45 }}>
                            <axesHelper args={[50]} />
                            {/* 기본 조명 */}
                            <ambientLight intensity={0.8} />
                            <directionalLight position={[5, 5, 5]} intensity={1} />

                            <Suspense fallback={<Html center><span style={{ color: '#ffffff' }}>loading...</span></Html>}>
                                {/* Coil STL */}
                                <group position={[0, 0, 0]}>
                                    <STLModel url={coilUrl} temp={coilTemp} min={minCoil} max={maxCoil} radius={1500} />
                                </group>

                                {/* Core STL */}
                                <group position={[12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                                    <STLModel url={coreUrl} temp={coreTemp} min={minCore} max={maxCore} radius={1500} />
                                </group>
                            </Suspense>

                            {/* 조작 */}
                            <OrbitControls />
                        </Canvas>
                }
            </div>
        </div>
    );
}

export default ViewerBox;