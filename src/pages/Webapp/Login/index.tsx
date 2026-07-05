import { useIntl } from '@umijs/max';
import { history, useModel, Helmet } from '@umijs/max';
import { message, Spin } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';

const WebappLogin: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('jwtToken');
    const redirect = urlParams.get('redirect') || '/';

    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      flushSync(() => {
        initialState
          ?.fetchUserInfo?.()
          .then((userInfo) => {
            if (userInfo) {
              setInitialState((s) => ({ ...s, currentUser: userInfo }));
              setTimeout(() => {
                history.push(redirect);
              }, 100);
            } else {
              message.error('登录失败，请重试');
            }
          })
          .catch(() => {
            message.error('登录失败，请重试');
          });
      });
    } else {
      message.error('缺少登录凭证');
      setTimeout(() => {
        history.push('/user/login');
      }, 1000);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 text-base">正在登录...</p>
      </div>
    </div>
  );
};

export default WebappLogin;
