/** @jsxImportSource @emotion/react */
import * as s from './style';
import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useRecoilState, useRecoilValue } from 'recoil';
import { coilUrlAtom, coreUrlAtom, outPutDatasAtom, selectedCoilStlAtom, selectedCoreStlAtom } from '../../atoms/dataAtoms';
import { IoIosClose } from "react-icons/io";
import { tabIdAtom } from '../../atoms/tabAtoms';

// 버텍스 셰이더 수정: 법선 벡터와 월드 위치를 프래그먼트 셰이더로 전달
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 프래그먼트 셰이더 수정: 조명을 이용해 금속 질감과 온도 색상을 혼합
const fragmentShader = `
  uniform vec3 uColorCold;
  uniform vec3 uColorHot;
  uniform float uColorMixFactor;

  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // 1. 온도에 따른 색상 혼합 (diffuse 색상)
    vec3 temperatureColor = mix(uColorCold, uColorHot, uColorMixFactor);
    
    // 2. 조명 계산을 위한 벡터 정의
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    vec3 reflectDirection = reflect(-lightDirection, normal);
    
    // 3. 확산광(Diffuse) 계산
    float diffuse = max(dot(normal, lightDirection), 0.0);
    vec3 diffuseColor = temperatureColor * diffuse;

    // 4. 반사광(Specular) 계산 (금속 질감)
    float shininess = 100.0; // 반사광의 퍼지는 정도 (높을수록 날카로운 반사)
    float specular = pow(max(dot(reflectDirection, viewDirection), 0.0), shininess);
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specular; // 흰색 반사광

    // 5. 최종 색상 = 확산광 + 반사광
    vec3 finalColor = diffuseColor + specularColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function STLModel({ url, data, min, max }) {
    const { camera } = useThree();
    const meshRef = useRef();
    const geometry = useLoader(STLLoader, url);
    const tempGeo = useMemo(() => geometry.center(), [geometry]);
    console.log(geometry)
    const [isHovered, setIsHovered] = useState(false);

    // 목표 uColorMixFactor를 저장하기 위한 State
    const [targetMixFactor, setTargetMixFactor] = useState(0.00);

    const shaderUniforms = useMemo(() => ({
        uColorCold: { value: new THREE.Color(0x0000ff) },
        uColorHot: { value: new THREE.Color(0xff0000) },
        uColorMixFactor: { value: 0.0 }, // 초기값은 0.0으로 설정
        uLightPosition: { value: new THREE.Vector3(10, 10, 10) },
        uCameraPosition: { value: camera.position },
    }), [camera]);

    // 온도 데이터가 변경될 때마다 목표 mixFactor 업데이트
    useEffect(() => {
        let newMixFactor;
        if (max === min) {
            newMixFactor = 0.5;
        } else {
            newMixFactor = (data - min) / (max - min);
            newMixFactor = Math.max(0.0, Math.min(1.0, newMixFactor));
        }
        setTargetMixFactor(newMixFactor);
    }, [data, min, max]);

    // useFrame 훅을 사용하여 매 프레임마다 mixFactor를 보간
    useFrame(() => {
        // 현재 mixFactor 값을 목표 값으로 서서히 이동
        shaderUniforms.uColorMixFactor.value = THREE.MathUtils.lerp(
            shaderUniforms.uColorMixFactor.value,
            targetMixFactor,
            0.05 // 보간 속도 (0에 가까울수록 느리게, 1에 가까울수록 빠르게)
        );
        // 카메라 위치 업데이트
        shaderUniforms.uCameraPosition.value.copy(camera.position);
    });

    return (
        <mesh
            ref={meshRef}
            geometry={tempGeo}
            scale={[0.5, 0.5, 0.5]}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            <shaderMaterial
                attach='material'
                args={[{
                    uniforms: shaderUniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                }]}
            />
            {
                !!data && isHovered &&
                <Html position={[0, geometry.boundingBox.max.y, 0]} center>
                    <div css={s.infoBox(data, max)}>
                        <p>Temperature: {data}</p>
                    </div>
                </Html>
            }
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
        if (!selectedCoilStl?.filePath) return;

        const checkAndLoad = async () => {
            const res = await window.electronAPI.checkFileExists(selectedCoilStl.filePath);

            if (res?.success && res?.exists) {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoilStl?.filePath);
                const blob = new Blob([fileBuffer], { type: 'model/stl' });
                setCoilUrl(URL.createObjectURL(blob));
            } else {
                setCoilUrl('');
                setSelectedCoilStl({})
                window.electronAPI.showAlert(res?.error);
            }
        }

        checkAndLoad();
    }, [selectedCoilStl]);

    useEffect(() => {
        if (!selectedCoreStl?.filePath) return;

        const checkAndLoad = async () => {
            const res = await window.electronAPI.checkFileExists(selectedCoreStl.filePath);

            if (res?.success && res?.exists) {
                const fileBuffer = await window.electronAPI.renderStl(selectedCoreStl?.filePath);
                const blob = new Blob([fileBuffer], { type: 'model/stl' });
                setCoreUrl(URL.createObjectURL(blob));
            } else {
                setCoreUrl('');
                setSelectedCoreStl({});
                window.electronAPI.showAlert(res?.error);
            }
        }

        checkAndLoad();
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
                    (coilUrl === '' || coreUrl === '')
                        ?
                        <>
                            <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoilStl)}>{selectedCoilStl?.fileName || 'COIL'}</div>
                            <div css={s.svgBox}>
                                <IoIosClose />
                            </div>
                            <div css={s.selectBox} onClick={() => handleSelectStlOnClick(setSelectedCoreStl)}>{selectedCoreStl?.fileName || 'CORE'}</div>
                        </>
                        :
                        <Canvas shadows style={{ borderEndStartRadius: 5, borderEndEndRadius: 5 }} camera={{ position: [0, 0, 100], fov: 45 }}>
                            <color attach='background' args={['#dbdbdb']} />

                            <axesHelper args={[50]} />
                            {/* 조명 */}
                            <ambientLight intensity={0.8} />
                            <directionalLight position={[5, 5, 5]} intensity={1} />

                            <Suspense fallback={<Html center><span style={{ color: '#666666' }}>loading...</span></Html>}>
                                <group position={[0, 0, 0]}>
                                    <STLModel
                                        url={coilUrl}
                                        data={!!outputDatas?.length && outputDatas[outputDatas?.length - 1]['Coil Temperature']?.data}
                                        min={0.00}
                                        max={15.00}
                                    />
                                </group>

                                <group position={[12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                                    <STLModel
                                        url={coreUrl}
                                        data={!!outputDatas?.length && outputDatas[outputDatas?.length - 1]['Core Temperature']?.data}
                                        min={0.00}
                                        max={10.00}
                                    />
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