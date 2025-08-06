import { Global } from '@emotion/react';
import { reset } from './style/theme';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { instance } from './apis/instance';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import IndexPage from './pages/IndexPage/IndexPage';

function App() {
  const [licenseStatus, setLicenseStatus] = useState(false);

  const validLicenseKey = useQuery({
    queryKey: ['licenseKey'],
    queryFn: () => instance.get(`/license/${localStorage.getItem('licenseKey')}`),
    enabled: localStorage.getItem('licenseKey') !== null,
    retry: 0,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    const licenseKey = localStorage.getItem('licenseKey')
    if(!licenseKey) {
      setLicenseStatus(true)
    }
  }, [])

  useEffect(() => {
    if(validLicenseKey.isError) {
      setLicenseStatus(true)
    }
  }, [validLicenseKey.isError])

  return (
    <>
      <Global styles={reset} />
      {
        licenseStatus
          ?
          <RegisterPage setLicenseStatus={setLicenseStatus}/>
          :
          <IndexPage />
      }
    </>
  );
}

export default App;
