import 'react-quill/dist/quill.snow.css';
import { SelectLang, AvatarDropdown, AvatarName } from '@/components';
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
  TransactionOutlined,
  TableOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  MoneyCollectOutlined,
  PieChartOutlined,
  DashboardOutlined,
  TranslationOutlined,
  WechatOutlined,
  NotificationOutlined,
  SwapOutlined,
  PieChartFilled,
  QrcodeOutlined,
  FundOutlined,
  LineChartOutlined,
  SettingOutlined,
  BellOutlined,
  FileOutlined,
  DollarCircleOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  PayCircleOutlined,
  OrderedListOutlined,
  VerifiedOutlined,
  AppstoreOutlined,
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
const webappLoginPath = '/webapp/login';

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
  TransactionOutlined: <TransactionOutlined />,
  TableOutlined: <TableOutlined />,
  RobotOutlined: <RobotOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  WalletOutlined: <WalletOutlined />,
  PlayCircleOutlined: <PlayCircleOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  HomeOutlined: <HomeOutlined />,
  InfoCircleOutlined: <InfoCircleOutlined />,
  PictureOutlined: <PictureOutlined />,
  MoneyCollectOutlined: <MoneyCollectOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  TranslationOutlined: <TranslationOutlined />,
  WechatOutlined: <WechatOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  SwapOutlined: <SwapOutlined />,
  PieChartFilled: <PieChartFilled />,
  QrcodeOutlined: <QrcodeOutlined />,
  FundOutlined: <FundOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  SettingOutlined: <SettingOutlined />,
  BellOutlined: <BellOutlined />,
  FileOutlined: <FileOutlined />,
  DollarCircleOutlined: <DollarCircleOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  MessageOutlined: <MessageOutlined />,
  PayCircleOutlined: <PayCircleOutlined />,
  OrderedListOutlined: <OrderedListOutlined />,
  VerifiedOutlined: <VerifiedOutlined />,
  LinkOutlined: <LinkOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
};

const loopMenuItem = (menus: MenuDataItem[], currentUser?: API.CurrentUser): MenuDataItem[] =>
  menus
    .filter((item) => {
      // 根據用戶權限過濾菜單
      if (item.path === '/channel-posts') {
        return currentUser?.isAdmin || currentUser?.channelPost === true;
      }
      if (item.path === '/reply-rules') {
        return currentUser?.isAdmin || currentUser?.replyRule === true;
      }
      if (item.path === '/group-messages') {
        return currentUser?.isAdmin || currentUser?.groupMessage === true;
      }
      return true;
    })
    .map(({ icon, children, ...item }) => {
      return {
        ...item,
        icon: icon && iconEnum[icon as string],
        children: children && loopMenuItem(children, currentUser),
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
  if (location.pathname !== loginPath && location.pathname !== webappLoginPath) {
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
        if (success) {
          return loopMenuItem(data, initialState?.currentUser);
        } else {
          return [];
        }
      },
    },
    waterMarkProps: {
      content: '',
    },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
        return;
      }
      // 非管理员用户只能停留在 /bots/:id 页面
      const currentUser = initialState?.currentUser;
      if (currentUser && !currentUser.isAdmin) {
        const isBotsPage = /^\/bots\/[^/]+(\/[^/]+)?(\?.*)?$/.test(location.pathname);
        const is404Page = location.pathname === '/404';
        if (!isBotsPage && !is404Page) {
          history.replace('/404');
        }
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
