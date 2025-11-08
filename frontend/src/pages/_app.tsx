import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
const PlanMe = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

PlanMe.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {
  const ctx = await App.getInitialProps(context);

  return { ...ctx };
};
export default appWithTranslation(PlanMe);
