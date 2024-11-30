import { Footer, SelectLang, AvatarDropdown, AvatarName } from '@/components';
import {
  DatabaseOutlined,
  GatewayOutlined,
  GlobalOutlined,
  HeartOutlined,
  LinkOutlined,
  MenuFoldOutlined,
  SecurityScanOutlined,
  SmileOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  ReadOutlined,
  SolutionOutlined,
  BookOutlined,
  CommentOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { fetchMenuData, currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React, { ReactElement } from 'react';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const iconEnum: { [key: string]: ReactElement<any, any> } = {
  UsergroupAddOutlined: <UsergroupAddOutlined />,
  SmileOutlined: <SmileOutlined />,
  HeartOutlined: <HeartOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  MenuFoldOutlined: <MenuFoldOutlined />,
  TeamOutlined: <TeamOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  GatewayOutlined: <GatewayOutlined />,
  SecurityScanOutlined: <SecurityScanOutlined />,
  UserOutlined: <UserOutlined />,
  ReadOutlined: <ReadOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  BookOutlined: <BookOutlined />,
  CommentOutlined: <CommentOutlined />,
  CrownOutlined: <CrownOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  StarOutlined: <StarOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  ProfileOutlined: <ProfileOutlined />,
};

console.log('iconEnum', iconEnum);

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => {
    return {
      ...item,
      icon: icon && iconEnum[icon as string],
      children: children && loopMenuItem(children),
    };
  });

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const response = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return response.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?._id,
      },
      request: async () => {
        // initialState.currentUser 中包含了所有用户信息
        const { data, success } = await fetchMenuData();
        console.log('data', data);
        if (success) {
          console.log('loopMenuItem(data)', loopMenuItem(data));
          return loopMenuItem(data);
        } else {
          return [];
        }
      },
    },
    waterMarkProps: {
      content: '',
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  baseURL: `${process.env.UMI_APP_API_URL}/api`,
  ...errorConfig,
};
