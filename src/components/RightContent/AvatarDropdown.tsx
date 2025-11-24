import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import { FormattedMessage, history, useAccess, useModel } from '@umijs/max';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { stringify } from 'querystring';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  const access = useAccess();

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    localStorage.removeItem('token');
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: { key: React.Key }) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });
        loginOut().catch(() => console.error);
        return;
      }
      history.push(`/account/${key}`);
    },
    [initialState, setInitialState],
  );

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.email) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'change-password',
      icon: <SettingOutlined />,
      label: <FormattedMessage id="menu.account.change-password" defaultMessage="修改密码" />,
    },
    ...(access.canSuperAdmin
      ? [
          {
            key: 'function-config',
            icon: <CustomerServiceOutlined />,
            label: <FormattedMessage id="menu.account.function-config" defaultMessage="功能配置" />,
          },
        ]
      : []),
    {
      key: 'two-factor-auth',
      icon: <VerifiedOutlined />,
      label: <FormattedMessage id="menu.account.two-factor-auth" defaultMessage="二步认证" />,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <FormattedMessage id="menu.account.logout" defaultMessage="退出登录" />,
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
