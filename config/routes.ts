/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */

import Icon from '@ant-design/icons/lib/components/Icon';
import route from 'mock/route';

export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome', // 默认重定向到 /welcome
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'SmileOutlined',
    component: './Welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
  {
    path: '/account/change-password',
    hideInMenu: true,
    name: 'list.change-password',
    icon: 'TableOutlined',
    component: './account/change-password',
  },
  {
    path: '/auth',
    name: 'list.auth',
    icon: 'table',
    access: 'canGetUser',
    routes: [
      {
        path: '/auth/users',
        name: 'list.users',
        icon: 'table',
        component: './Auth/Users',
      },
      {
        path: '/auth/roles',
        name: 'list.roles',
        icon: 'table',
        component: './Auth/Roles',
      },
      {
        path: '/auth/menus',
        name: 'list.menus',
        icon: 'table',
        component: './Auth/Menus',
      },
      {
        path: '/auth/permissions',
        name: 'list.permissions',
        component: './Auth/Permissions',
      },
      {
        path: '/auth/permission-groups',
        name: 'list.permission_groups',
        component: './Auth/PermissionGroups',
      },
      {
        path: '/auth/data-permissions',
        name: 'list.data_permissions',
        component: './Auth/DataPermissions',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'list.dashboard',
    icon: 'DashboardOutlined',
    component: './Dashboard',
  },
  {
    path: '/multilingual-management',
    name: 'list.multilingual-management',
    icon: 'TranslationOutlined',
    routes: [
      {
        path: '/multilingual-management/languages',
        name: 'list.languages',
        component: './MultilingualManagement/Langue',
        icon: 'TranslationOutlined',
      },
      {
        path: '/multilingual-management/translates',
        name: 'list.translates',
        component: './MultilingualManagement/Translate',
        icon: 'TranslationOutlined',
      },
    ],
  },
  {
    path: '/proxies',
    name: 'list.proxies',
    icon: 'GlobalOutlined',
    component: './Proxy',
  },
  {
    path: '/employees',
    name: 'list.employees',
    icon: 'UsergroupAddOutlined',
    component: './Employee',
  },
  {
    path: '/withdraws',
    name: 'list.withdraw',
    icon: 'WalletOutlined',
    component: './Withdraw',
  },
  {
    path: '/instructions',
    name: 'list.instructions',
    icon: 'QuestionCircleOutlined',
    component: './Instruction',
  },
  {
    path: '/members',
    name: 'list.members',
    icon: 'UserOutlined',
    component: './Members',
  },
  {
    path: '/customers',
    name: 'list.customers',
    icon: 'UserOutlined',
    component: './Customers',
  },
  {
    path: '/wallets',
    name: 'list.wallets',
    icon: 'WalletOutlined',
    routes: [
      {
        path: '/wallets/share',
        name: 'list.wallets-share',
        component: './Wallet/Wallet',
      },
      {
        path: '/wallets/index',
        name: 'list.wallets-formalities',
        component: './Wallet/Formalities',
      },
    ],
  },
  {
    path: '/wallet-deal-records',
    name: 'list.walletDealRecords',
    icon: 'TransactionOutlined',
    component: './WalletDealRecord',
  },
  {
    path: '/transactions',
    name: 'list.transactions',
    icon: 'TransactionOutlined',
    component: './Transaction',
  },
  {
    path: '/carousels',
    name: 'list.carousels',
    icon: 'PictureOutlined',
    component: './Carousel',
  },
  {
    path: '/stacking-configurations',
    name: 'list.stacking-configurations',
    icon: 'MoneyCollectOutlined',
    component: './StackingConfiguration',
  },
  {
    path: '/lottery-records',
    name: 'list.lottery-records',
    icon: 'TrophyOutlined',
    component: './LotteryRecord',
  },
  {
    path: '/proxy-commission-records',
    name: 'list.proxy-commission-records',
    icon: 'PieChartOutlined',
    component: './ProxyCommissionRecord',
  },
  {
    path: '/questions',
    name: 'list.questions',
    icon: 'WechatOutlined',
    component: './Question',
  },
  {
    path: '/activities',
    name: 'list.activities',
    icon: 'TranslationOutlined',
    routes: [
      {
        path: '/activities/index',
        name: 'list.activities',
        component: './Activity/Activity',
        icon: 'TranslationOutlined',
      },
      {
        path: '/activities/release-records',
        name: 'list.release-records',
        component: './Activity/ReleaseRecord',
        icon: 'TranslationOutlined',
      },
    ],
  },
  {
    path: '/notices',
    name: 'list.notices',
    icon: 'NotificationOutlined',
    component: './Notice',
  },
  {
    path: '/exchanges',
    name: 'list.exchanges',
    Icon: 'SwapOutlined',
    component: './Exchange',
  },
  {
    path: '/incomes',
    name: 'list.incomes',
    icon: 'MoneyCollectOutlined',
    component: './Income',
  },
  {
    path: '/transfers',
    name: 'list.transfers',
    icon: 'TransactionOutlined',
    component: './Transfer',
  },
];
