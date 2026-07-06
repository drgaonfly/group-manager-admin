import { useIntl } from '@umijs/max';
import { history, useModel, Helmet } from '@umijs/max';
import { message, Spin } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const WebappLogin: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();
  const [status, setStatus] = useState<string>('正在登录...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('jwtToken');
    const redirect = urlParams.get('redirect') || '/';

    setStatus('检查登录凭证...');

    if (jwtToken) {
      setStatus('保存登录凭证...');
      try {
        localStorage.setItem('token', jwtToken);
        setStatus('登录凭证已保存');
      } catch (e: any) {
        const errorMsg = `localStorage 错误: ${e?.message || '未知错误'}`;
        setStatus('登录失败');
        setError(errorMsg);
        message.error('无法保存登录凭证，请尝试使用 URL 方式登录');
        return;
      }

      setStatus('获取用户信息...');
      flushSync(() => {
        initialState
          ?.fetchUserInfo?.()
          .then((userInfo) => {
            setStatus('用户信息获取成功');
            if (userInfo) {
              setInitialState((s) => ({ ...s, currentUser: userInfo }));
              setStatus('跳转到目标页面...');
              setTimeout(() => {
                history.push(redirect);
              }, 100);
            } else {
              setStatus('登录失败');
              setError('用户信息为空');
              message.error('登录失败，请重试');
            }
          })
          .catch((error) => {
            const errorMsg = `获取用户信息失败: ${error?.message || '未知错误'}`;
            setStatus('登录失败');
            setError(errorMsg);
            message.error('登录失败，请重试');
          });
      });
    } else {
      setStatus('登录失败');
      setError('缺少 jwtToken 参数，请检查 URL 是否正确');
      message.error('缺少登录凭证');
      // 不自动跳转，让用户看到错误信息
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
      <div className="text-center max-w-md w-full">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 text-base font-medium">{status}</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebappLogin;
