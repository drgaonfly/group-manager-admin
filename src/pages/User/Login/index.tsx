import { useIntl } from '@umijs/max';
// import { Footer } from '@/components';
import { addItem, login } from '@/services/ant-design-pro/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, history, SelectLang, useModel, Helmet } from '@umijs/max';
import { message, Form } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();
  const [requires2FA, setRequires2FA] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [form] = Form.useForm();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams & { redirect?: string }) => {
    try {
      if (requires2FA) {
        // 2FA verification phase
        const response = await addItem('/auth/login/verify-2fa', {
          sessionId,
          token: values.token,
        });

        if (response.token) {
          localStorage.setItem('token', response.token);
          await fetchUserInfo();
          const urlParams = new URL(window.location.href).searchParams;
          history.push(values.redirect || urlParams.get('redirect') || '/');
        } else {
          message.error(
            intl.formatMessage({
              id: 'pages.login.2fa.failure',
              defaultMessage: '验证码错误',
            }),
          );
        }
      } else {
        // Initial login phase
        const response = await login({ ...values });
        if (response.requires2FA) {
          setRequires2FA(true);
          setSessionId(response.sessionId!);
        } else if (response && response.success) {
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          message.success(defaultLoginSuccessMessage);
          localStorage.setItem('token', response.token!);
          localStorage.setItem('refreshToken', response.refreshToken!);
          await fetchUserInfo();
          const urlParams = new URL(window.location.href).searchParams;
          history.push(values.redirect || urlParams.get('redirect') || '/');
        }
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(error?.response?.data?.message || defaultLoginFailureMessage);
    }
  };

  // Auto-login from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('jwtToken');
    const email = urlParams.get('email');
    const password = urlParams.get('password');
    const redirect = urlParams.get('redirect') || '/';

    // jwtToken 直接登录（Bot 端换取，无需账密）
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      flushSync(() => {
        initialState?.fetchUserInfo?.().then((userInfo) => {
          if (userInfo) {
            setInitialState((s) => ({ ...s, currentUser: userInfo }));
          }
        });
      });
      setTimeout(() => {
        history.push(redirect);
      }, 100);
      return;
    }

    // 账密自动登录
    if (email && password) {
      form.setFieldsValue({ email, password });
      setTimeout(() => {
        handleSubmit({ email, password, redirect: redirect || undefined });
      }, 100);
    }
  }, []);

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title={process.env.UMI_APP_APP_NAME || 'antd-ts-admin'}
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <>
            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.username.placeholder',
                defaultMessage: '用户名',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="请输入用户名!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: '密码',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="请输入密码！"
                    />
                  ),
                },
              ]}
            />
            {requires2FA && (
              <ProFormText
                name="token"
                fieldProps={{
                  size: 'large',
                  maxLength: 6,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.2fa.placeholder',
                  defaultMessage: '6位验证码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.2fa.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
              />
            )}
          </>
        </LoginForm>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Login;
