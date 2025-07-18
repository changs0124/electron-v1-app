import { Global } from '@emotion/react';
import { reset } from './style/theme';
import IndexPage from './pages/IndexPage/IndexPage';

function App() {
  return (
    <>
      <Global styles={reset} />
      <IndexPage />
    </>
  );
}

export default App;
