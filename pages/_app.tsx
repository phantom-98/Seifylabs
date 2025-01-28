import type { AppProps } from "next/app";

import { AuthProvider } from "@saas-ui/auth";
import { SaasProvider } from "@saas-ui/react";
import { Layout } from "components/layout";

import theme from "../theme";
import { AppProvider } from "components/context/app-context";

function MyApp({ Component, pageProps }: AppProps) {
  const { header, footer } = pageProps;

  return (
    <SaasProvider theme={theme}>
      <AuthProvider>
        <AppProvider>
          <Layout
            headerProps={header}
            footerProps={footer}
          >
            <Component {...pageProps} />
          </Layout>
        </AppProvider>
      </AuthProvider>
    </SaasProvider>
  );
}

export default MyApp;
