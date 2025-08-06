/** @jsxImportSource @emotion/react */
import * as s from './style';
import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useRecoilState, useRecoilValue } from 'recoil';
import { coilUrlAtom, coreUrlAtom, outPutDatasAtom, selectedCoilStlAtom, selectedCoreStlAtom } from '../../atoms/dataAtoms';
import { IoIosClose } from "react-icons/io";
import { tabIdAtom } from '../../atoms/tabAtoms';

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorCold;
  uniform vec3 uColorHot;
  uniform float uColorMixFactor;

  void main() {
    vec3 finalColor = mix(uColorCold, uColorHot, uColorMixFactor);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function STLModel({ url, temp, min, max }) {
    const geometry = useLoader(STLLoader, url);
    const tempGeo = useMemo(() => geometry.center(), [geometry]);
    const meshRef = useRef();

    const shaderUniforms = useMemo(() => ({
        uColorCold: { value: new THREE.Color(0x0000ff) }, // 파란색
        uColorHot: { value: new THREE.Color(0xff0000) },  // 빨간색
        uColorMixFactor: { value: 0.0 }, // 초기값은 0 (파란색)
    }), []);

    useEffect(() => {
        if (max === min) {
            // max와 min이 같으면 0.5로 설정하여 중간색 표시
            shaderUniforms.uColorMixFactor.value = 0.5;
        } else {
            // 온도를 0.0에서 1.0 사이의 값으로 정규화
            const mixFactor = (temp - min) / (max - min);
            // mixFactor가 0.0 ~ 1.0 범위를 벗어나지 않도록 클램핑
            shaderUniforms.uColorMixFactor.value = Math.max(0.0, Math.min(1.0, mixFactor));
        }
    }, [temp, min, max, shaderUniforms]);

    return (
        <mesh ref={meshRef} geometry={tempGeo} scale={[0.5, 0.5, 0.5]}>
            <shaderMaterial
                attach="material"
                args={[{
                    uniforms: shaderUniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                }]}
            />
        </mesh>
    );
}

function ViewerBox() {
    const tabId = useRecoilValue(tabIdAtom);
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));

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
                                    <STLModel url={coilUrl} temp={!!outputDatas?.length && outputDatas[outputDatas?.length-1]['Coil Temperature']?.temp} min={0.00} max={15.00} radius={1500} />
                                </group>

                                {/* Core STL */}
                                <group position={[12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                                    <STLModel url={coreUrl} temp={!!outputDatas?.length && outputDatas[outputDatas?.length-1]['Core Temperature']?.temp} min={0.00} max={10.00} radius={1500} />
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