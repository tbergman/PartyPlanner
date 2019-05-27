import React from 'react';
import { withRouter, WithRouterProps } from 'next/router';
import { isBrowser } from '@apolloSetup/initApollo';
import { Exception } from 'ant-design-pro';
import css from '@emotion/css';
import {
  withApolloAuth,
  WithApolloAuthInjectedProps
} from '@apolloSetup/withApolloAuth';
import { Button } from 'antd';

const ExceptionStyles = css`
  width: 100%;
  height: 100vh;
`;

const SocialAuth: React.FC<WithRouterProps & WithApolloAuthInjectedProps> = ({
  router
}) => {
  const routerQuery = router && router.query;

  function handleSuccess() {
    if (!window.opener) {
      router && router.push('/');
      return null;
    }
    window.opener.postMessage(routerQuery!.jwt, 'http://localhost:3000');
  }

  function handleError() {
    if (!window.opener) {
      return null;
    }
    window.opener.postMessage('close', 'http://localhost:3000');
  }

  const isSuccessful =
    routerQuery && routerQuery.jwt && routerQuery.state === 'success';

  const isNotSuccessful = routerQuery && routerQuery.state === 'error';

  const shouldNotBeHere =
    routerQuery && (!routerQuery.state || !routerQuery.jwt);

  if (isSuccessful && isBrowser()) handleSuccess();

  if (isNotSuccessful) {
    return (
      <Exception
        title="Oops!"
        desc="Something went wrong"
        img={'../static/warning.svg'}
        actions={
          <Button type="primary" onClick={handleError}>
            Close this window
          </Button>
        }
        css={[ExceptionStyles]}
      />
    );
  }

  if (shouldNotBeHere && isBrowser()) {
    return (
      <Exception
        type="403"
        img="../static/security.svg"
        css={[ExceptionStyles]}
        backText="Back to home"
        desc="Not authorized"
      />
    );
  }

  return null;
};

export default withRouter(
  withApolloAuth({ userHasToBe: 'notAuthenticated' })(SocialAuth)
);
