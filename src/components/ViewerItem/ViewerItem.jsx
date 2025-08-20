/** @jsxImportSource @emotion/react */
import * as s from './style';
import * as THREE from 'three';
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useMemo, useEffect } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorCold;
  uniform vec3 uColorHot;
  uniform float uColorMixFactor;
  uniform bool uIsDataAvailable;
  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    vec3 reflectDirection = reflect(-lightDirection, normal);

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float shininess = 100.0;
    float specular = pow(max(dot(reflectDirection, viewDirection), 0.0), shininess);
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specular;

    vec3 finalColor;
    if (uIsDataAvailable) {
      vec3 temperatureColor = mix(uColorCold, uColorHot, uColorMixFactor);
      vec3 diffuseColor = temperatureColor * diffuse;
      finalColor = diffuseColor + specularColor;
    } else {
      vec3 grayColor = vec3(0.5, 0.5, 0.5);
      vec3 diffuseColor = grayColor * diffuse;
      finalColor = diffuseColor + specularColor;
    }
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function ViewerItem({ filePath, data, min, max }) {
    const { camera } = useThree();
    const meshRef = useRef(null);

    const [geometry, setGeometry] = useState(null);
    const [centerOffset, setCenterOffset] = useState(() => new THREE.Vector3());
    const [isHovered, setIsHovered] = useState(false);
    const [isDataAvailable, setIsDataAvailable] = useState(false);
    const [targetMixFactor, setTargetMixFactor] = useState(0.0);

    // filePath → ArrayBuffer → STL parse (경계 즉시 계산)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!filePath) { setGeometry(null); return; }

            const exists = await window.electronAPI.checkFileExists(filePath);
            if (!exists?.success || !exists?.exists) {
                if (!cancelled) setGeometry(null);
                return;
            }

            const fileBuffer = await window.electronAPI.renderStl(filePath);
            const ab = fileBuffer instanceof ArrayBuffer ? fileBuffer : new Uint8Array(fileBuffer).buffer;

            const loader = new STLLoader();
            const geo = loader.parse(ab);

            // 경계값 즉시 계산해 프러스텀 컬링 안정화
            geo.computeBoundingBox();
            geo.computeBoundingSphere();

            // 지오메트리를 변형(center)하지 않고, 메쉬 위치를 역이동해서 중앙정렬
            const c = geo.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3();

            if (!cancelled) {
                setCenterOffset(c);
                setGeometry(geo);
            }
        })();

        return () => { cancelled = true; };
    }, [filePath]);

    const shaderUniforms = useMemo(() => ({
        uColorCold: { value: new THREE.Color(0x0000ff) },
        uColorHot: { value: new THREE.Color(0xff0000) },
        uColorMixFactor: { value: 0.0 },
        uIsDataAvailable: { value: false },
        uLightPosition: { value: new THREE.Vector3(10, 10, 10) },
        uCameraPosition: { value: camera.position },
    }), [camera]);

    // 데이터 유무/색상 보간
    useEffect(() => {
        const ok = typeof data === 'number' && typeof min === 'number' && typeof max === 'number';
        setIsDataAvailable(ok);
        if (ok) {
            let mix = max === min ? 0.5 : (data - min) / (max - min);
            setTargetMixFactor(Math.max(0, Math.min(1, mix)));
        } else {
            setTargetMixFactor(0.0);
        }
    }, [data, min, max]);

    useFrame(() => {
        shaderUniforms.uIsDataAvailable.value = isDataAvailable;
        if (isDataAvailable) {
            shaderUniforms.uColorMixFactor.value = THREE.MathUtils.lerp(
                shaderUniforms.uColorMixFactor.value,
                targetMixFactor,
                0.03
            );
        }
        shaderUniforms.uCameraPosition.value.copy(camera.position);
    });

    // bbox는 geometry에서 직접 사용 (이미 computeBoundingBox 호출됨)
    const bbox = useMemo(() => {
        if (!geometry) return null;
        // 안전 차원에서 다시 한번 보장
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        return geometry.boundingBox?.clone() ?? null;
    }, [geometry]);

    // 로딩 중엔 렌더하지 않음 (Hook 순서는 위에서 이미 고정)
    if (!geometry) return null;

    const scale = 0.5;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            // center() 대신 메쉬를 역이동하여 중앙 정렬
            position={[
                -centerOffset.x * scale,
                -centerOffset.y * scale,
                -centerOffset.z * scale
            ]}
            scale={[scale, scale, scale]}
            // 컬링 문제 완전 방지하고 싶으면 주석 해제
            // frustumCulled={false}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setIsHovered(true); }}
            onPointerOut={() => { document.body.style.cursor = 'default'; setIsHovered(false); }}
        >
            <shaderMaterial
                attach="material"
                args={[{
                    uniforms: shaderUniforms,
                    vertexShader,
                    fragmentShader,
                }]}
            />
            {!!data && isHovered && bbox && (
                <Html position={[0, bbox.max.y * scale, 0]} center>
                    <div css={s.infoBox(data, max)}><p>Temp: {data}°C</p></div>
                </Html>
            )}
        </mesh>
    );
}

export default ViewerItem;