/** @jsxImportSource @emotion/react */
import * as s from './style';
import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Html, OrbitControls, TransformControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useRecoilState, useRecoilValue } from 'recoil';
import { tabIdAtom } from '../../atoms/tabAtoms';
import { coilUrlAtom, coreUrlAtom, selectedCoilStlAtom, selectedCoreStlAtom } from '../../atoms/dataAtoms';
import { IoIosClose } from "react-icons/io";

// function getColor(t) {
//     t = Math.max(0, Math.min(1, t));
//     if (isNaN(t)) t = 0; // 🔥 추가 방어 코드

//     t = Math.pow(t, 0.6); // 곡선 조절로 빨강 진입 빨리

//     let r = 0, g = 0, b = 0;

//     if (t <= 0.1) {
//         r = 0;
//         g = t / 0.1;
//         b = 1;
//     } else if (t <= 0.2) {
//         r = 0;
//         g = 1;
//         b = 1 - (t - 0.1) / 0.1;
//     } else if (t <= 0.3) {
//         r = (t - 0.2) / 0.1;
//         g = 1;
//         b = 0;
//     } else {
//         r = 1;
//         g = 1 - (t - 0.3) / 0.7;
//         b = 0;
//     }

//     if ([r, g, b].some(v => isNaN(v))) {
//         console.warn("⚠️ getColor() returned NaN! t =", t);
//         return new THREE.Color(0.5, 0.5, 0.5); // fallback color
//     }

//     return new THREE.Color(r, g, b);
// }


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

// function STLModel({ url, temp, min, max, radius }) {
//     const [loca, setLoca] = useState(null);
//     const model = useLoader(STLLoader, url);

//     const geometry = useMemo(() => {
//         const tempModel = model.clone();
//         tempModel.center();

//         const nonIndexed = tempModel.index ? tempModel.toNonIndexed() : tempModel;
//         const pos = nonIndexed.attributes.position.array;
//         const colors = [];

//         const isInitialized = loca !== null && typeof loca.x === 'number';

//         for (let i = 0; i < pos.length; i += 3) {
//             const x = pos[i], y = pos[i + 1], z = pos[i + 2];

//             let color = new THREE.Color(0.8, 0.8, 0.8);

//             if (isInitialized) {
//                 const dx = x - loca.x;
//                 const dy = y - loca.y;
//                 const dz = z - loca.z;
//                 const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

//                 if (dist < radius) {
//                     const weight = Math.pow(1 - dist / radius, 1.2);
//                     const weightedTemp = temp * weight;
//                     const normalized = (max === min) ? 0 : (weightedTemp - min) / (max - min);
//                     color = getColor(normalized);
//                 }
//             }

//             colors.push(color.r, color.g, color.b);
//         }

//         nonIndexed.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
//         return nonIndexed;
//     }, [model, loca, temp, min, max]);

//     return (
//         <group>
//             <mesh geometry={geometry}
//                 scale={[0.5, 0.5, 0.5]}
//                 onClick={e => {
//                     e.stopPropagation();
//                     setLoca(e.point.clone());
//                 }}
//             >
//                 <meshStandardMaterial
//                     vertexColors
//                     polygonOffset
//                     polygonOffsetFactor={1}
//                     polygonOffsetUnits={1}
//                 />
//             </mesh>

//             <lineSegments geometry={new THREE.WireframeGeometry(geometry)} scale={[0.5, 0.5, 0.5]}>
//                 <lineBasicMaterial color="black" />
//             </lineSegments>
//         </group>
//     );
// }

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
        // <TransformControls object={meshRef} mode="translate">
        <mesh ref={meshRef} geometry={tempGeo} scale={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial
                ref={ref}
                polygonOffset
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
            />
        </mesh>
        // </TransformControls>
    );
}

function ViewerBox({ coilTemp, minCoil, maxCoil, coreTemp, minCore, maxCore }) {

    const tabId = useRecoilValue(tabIdAtom);
    const [selectedCoilStl, setSelectedCoilStl] = useRecoilState(selectedCoilStlAtom(tabId));
    const [coilUrl, setCoilUrl] = useRecoilState(coilUrlAtom(tabId));

    const [selectedCoreStl, setSelectedCoreStl] = useRecoilState(selectedCoreStlAtom(tabId));
    const [coreUrl, setCoreUrl] = useRecoilState(coreUrlAtom(tabId));


    useEffect(() => {
        if (selectedCoilStl?.fileName !== "" && selectedCoilStl?.filePath !== "") {
            const getStlUrl = async () => {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoilStl?.filePath, selectedCoilStl?.fileName);
                const blob = new Blob([fileBuffer], { type: "model/stl" })
                setCoilUrl(URL.createObjectURL(blob));
            }

            getStlUrl();
        }
    }, [selectedCoilStl])

    useEffect(() => {
        if (selectedCoreStl?.fileName !== "" && selectedCoreStl?.filePath !== "") {
            const getStlUrl = async () => {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoreStl.filePath, selectedCoreStl.fileName);
                const blob = new Blob([fileBuffer], { type: "model/stl" })
                setCoreUrl(URL.createObjectURL(blob));
            }

            getStlUrl();
        }
    }, [selectedCoreStl])

    const handleSelectStlOnClick = async (setState) => {
        const res = await window.electronAPI.selectStl();

        if (res) {
            setState({
                filePath: res.filePath,
                fileName: res.fileName
            })
        }
    }

    return (
        <div css={s.layout}>
            <p css={s.titleBox}>VIEWER</p>
            <div css={s.container}>
                {
                    (coilUrl === "" || coreUrl === "")
                        ?
                        <>
                            {
                                selectedCoilStl?.filePath !== "" && selectedCoilStl?.fileName !== ""
                                    ?
                                    <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoilStl)}>{selectedCoilStl?.fileName}</div>
                                    :
                                    <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoilStl)}>COIL</div>
                            }
                            <div css={s.svgBox}>
                                <IoIosClose />
                            </div>
                            {
                                selectedCoreStl?.filePath !== "" && selectedCoreStl?.fileName !== ""
                                    ?
                                    <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoreStl)}>{selectedCoreStl?.fileNamel}</div>
                                    :
                                    <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoreStl)}>CORE</div>
                            }
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