import React from 'react';
import App, { Container, NextAppContext } from 'next/app';
import 'ant-design-pro/dist/ant-design-pro.css';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-client';
import AppLayout from '@components/Layout';
import Router, { DefaultQuery } from 'next/router';
import NProgress from 'nprogress';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { NextContext } from 'next';
import withApollo from '@apolloSetup/withApollo';

Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

const PAGES_WITHOUT_HEADER = [
  '/auth-social-success',
  '/auth-social-error',
  '/auth-social-reauth-success',
  '/join-party'
];

export const NOT_AUTHENTICATED_ROUTES = [
  '/',
  '/auth-login',
  '/auth-register',
  '/auth-social-success',
  '/auth-social-error',
  '/auth-forgot-password',
  '/auth-reset-password'
];

const PAGES_WITH_SIDER = ['/party'];

export interface NextContextWithApollo<
  Query extends DefaultQuery = DefaultQuery
> extends NextContext<Query> {
  apolloClient: ApolloClient<any>;
  isVirtualCall?: boolean;
}

class MyApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
  withHeader: boolean;
}> {
  public static async getInitialProps({ Component, ctx }: NextAppContext) {
    let pageProps = {};
    let withHeader = true;
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    if (PAGES_WITHOUT_HEADER.includes(ctx.pathname)) withHeader = false;
    return { pageProps, withHeader };
  }
  public render() {
    const {
      Component,
      pageProps,
      apolloClient,
      withHeader,
      router
    } = this.props;

    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <ApolloHooksProvider client={apolloClient}>
            <AppLayout
              withHeader={withHeader}
              hasSider={router && PAGES_WITH_SIDER.includes(router.pathname)}
            >
              <Component {...pageProps} />
            </AppLayout>
          </ApolloHooksProvider>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
