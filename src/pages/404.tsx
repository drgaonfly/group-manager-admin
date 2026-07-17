import { history, useIntl, useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.isAdmin;

  return (
    <Result
      status="404"
      title="404"
      subTitle={intl.formatMessage({ id: 'pages.404.subTitle' })}
      extra={
        isAdmin ? (
          <Button type="primary" onClick={() => history.push('/')}>
            {intl.formatMessage({ id: 'pages.404.buttonText' })}
          </Button>
        ) : null
      }
    />
  );
};

export default NoFoundPage;
