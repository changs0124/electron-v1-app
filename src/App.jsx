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

  const [licenseStatus, setLicenseStatus] = useState(true);

  const validLicenseKey = useQuery({
    queryKey: ['licenseKey', tabId],
    queryFn: () => instance.get(`/license/${localStorage.getItem('licenseKey')}`),
    enabled: true,
    retry: 0,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (validLicenseKey?.isSuccess) {
      setLicenseStatus(false)
    }
  }, [validLicenseKey])

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
