import { Global } from '@emotion/react';
import { reset } from './style/theme';
import IndexPage from './pages/IndexPage/IndexPage';
import { useEffect } from 'react';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import { useRecoilState } from 'recoil';
import { licenseStatusAtom } from './atoms/statusAtoms';

function App() {
  const [licenseStatus, setLicenseStatus] = useRecoilState(licenseStatusAtom);

  useEffect(() => {
    const licenseKey = localStorage.getItem('licenseKey')

    if (!licenseKey) {
      setLicenseStatus(false);
      return;
    }

  }, [licenseStatus])

  return (
    <>
      <Global styles={reset} />
      {
        licenseStatus
          ?
          <RegisterPage />
          :
          <IndexPage />
      }
    </>
  );
}

export default App;
