import { Global } from '@emotion/react';
import { reset } from './style/theme';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { instance } from './apis/instance';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import IndexPage from './pages/IndexPage/IndexPage';
import { useRecoilValue } from 'recoil';
import { tabIdAtom } from './atoms/tabAtoms';

function App() {
  const tabId = useRecoilValue(tabIdAtom);

  const [licenseStatus, setLicenseStatus] = useState(false);

  const validLicenseKey = useQuery({
    queryKey: ['licenseKey', tabId],
    queryFn: () => instance.get(`/license/${localStorage.getItem('licenseKey')}`).then(res => res?.data),
    enabled: true,
    retry: 0,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (validLicenseKey?.isSuccess) {
      setLicenseStatus(false);
      return;
    }

    if (validLicenseKey?.isError) {
      setLicenseStatus(true);
      return;
    }
  }, [validLicenseKey])

  useEffect(() => {
    if (validLicenseKey?.isSuccess) {
      if (validLicenseKey?.data.startsWith('주의:')) {
        const warningInfo = JSON.parse(sessionStorage.getItem('licenseWarningInfo'));
        const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 YYYY-MM-DD

        // 로컬 스토리지에 정보가 없거나, 저장된 날짜가 오늘이 아닌 경우에만 알림
        if (!warningInfo || warningInfo?.date !== today) {
          window.electronAPI.showAlert(validLicenseKey?.data);

          // 오늘 날짜와 메시지를 로컬 스토리지에 저장
          sessionStorage.setItem('licenseWarningInfo', JSON.stringify({
            date: today,
            message: validLicenseKey?.data
          }));
        }
      }

      setLicenseStatus(false);
      return;
    }

    if (validLicenseKey?.isError) {
      setLicenseStatus(true);
      // 오류 발생 시 로컬 스토리지 초기화
      sessionStorage.removeItem('licenseWarningInfo');
      return;
    }
  }, [validLicenseKey]);

  return (
    <>
      <Global styles={reset} />
      {
        licenseStatus
          ?
          <RegisterPage setLicenseStatus={setLicenseStatus} />
          :
          <IndexPage />
      }
    </>
  );
}

export default App;
