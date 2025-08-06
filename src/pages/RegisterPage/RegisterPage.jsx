/** @jsxImportSource @emotion/react */
import * as s from './style';
import Layout from "../../components/Layout/Layout";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { instance } from '../../apis/instance';

function RegisterPage({ setLicenseStatus }) {
    const [licenseKey, setLisenseKey] = useState('');

    const activateLicenseKey = useMutation({
        mutationFn: () => instance.patch(`/license/${licenseKey}`),
        onSuccess: async (res) => {
            await window.electronAPI.showAlert(res?.data);
            localStorage.setItem('licenseKey', licenseKey);
            setLicenseStatus(false)
        },
        onError: async (e) => {
            await window.electronAPI.showAlert(e?.response?.data);
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
                        <input type="text" value={licenseKey} onChange={handleLicenseKeyOnChange} />
                    </div>
                    <div css={s.buttonBox}>
                        <button onClick={() => activateLicenseKey.mutateAsync().catch(() => { })}>Activate</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default RegisterPage;