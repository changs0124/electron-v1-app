/** @jsxImportSource @emotion/react */
import * as s from './style';
import Layout from "../../components/Layout/Layout";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { instance } from '../../apis/instance';
import { useSetRecoilState } from 'recoil';
import { licenseStatusAtom } from '../../atoms/statusAtoms';

function RegisterPage() {
    
    const setLicenseStatus = useSetRecoilState(licenseStatusAtom);
    
    const [licenseKey, setLisenseKey] = useState('');

    const register = useMutation({
        mutationFn: () => instance.post('license', licenseKey),
        onSuccess: () => {
            localStorage.setItem('licenseKey', licenseKey);
            setLicenseStatus(false)
        },
        onError: () => {

        }
    })

    const handleLicenseKeyOnChange = (e) => {
        setLisenseKey(e.target.value);
    }

    return (
        <Layout>
            <div css={s.layout}>
                <div css={s.titleBox}>
                    <p>Please enter your license key.</p>
                </div>
                <div css={s.container}>
                    <div css={s.inputBox}>
                        <input type="text" value={licenseKey} onChange={handleLicenseKeyOnChange}/>
                    </div>
                    <div css={s.buttonBox}>
                        <button onClick={register.mutateAsync().catch(() => {})}>REGISTER</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default RegisterPage;