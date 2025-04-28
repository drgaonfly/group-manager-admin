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
    component: './RootRedirect',
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
    path: '/account/service-link',
    // hideInMenu: true,
    name: 'list.service-link',
    icon: 'CustomerServiceOutlined',
    component: './account/service-link',
  },
  {
    path: '/account/two-factor-auth',
    hideInMenu: true,
    name: 'list.two-factor',
    icon: 'SecurityScanOutlined',
    component: './account/two-factor',
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
    path: '/wallet-deal-records',
    name: 'list.walletDealRecords',
    icon: 'TransactionOutlined',
    component: './WalletDealRecord',
  },
  {
    path: '/proxy-commission-records',
    name: 'list.proxy-commission-records',
    icon: 'PieChartOutlined',
    component: './ProxyCommissionRecord',
  },
  {
    path: '/activities',
    name: 'list.activities',
    icon: 'TranslationOutlined',
    routes: [
      {
        path: '/activities/index',
        name: 'list.activities.index',
        component: './Activity/Activity',
        icon: 'TranslationOutlined',
      },
      {
        path: '/activities/release-records',
        name: 'list.activities.release-records',
        component: './Activity/ReleaseRecord',
        icon: 'TranslationOutlined',
      },
    ],
  },
  {
    path: '/mining-output',
    name: 'list.mining-output',
    icon: 'LineChartOutlined',
    component: './MiningOutput',
  },
  {
    path: '/settings',
    name: 'list.settings',
    icon: 'SettingOutlined',
    component: './Setting',
  },
  {
    path: '/liquidity',
    name: 'list.liquidity',
    icon: 'SettingOutlined',
    component: './Liquidity',
  },
  {
    path: '/depth-incomes',
    name: 'list.depth-incomes',
    icon: 'FundOutlined',
    component: './DepthIncome',
  },
  {
    path: '/team-benefits',
    name: 'list.team-benefits',
    icon: 'TeamOutlined',
    component: './TeamBenefit',
  },

  // 内容管理
  {
    path: '/content',
    name: 'list.content',
    icon: 'FileOutlined',
    routes: [
      {
        path: '/content/carousels',
        name: 'list.carousels',
        icon: 'PictureOutlined',
        component: './Content/Carousel',
      },
      {
        path: '/content/questions',
        name: 'list.questions',
        icon: 'WechatOutlined',
        component: './Content/Question',
      },
      {
        path: '/content/notices',
        name: 'list.notices',
        icon: 'NotificationOutlined',
        component: './Content/Notice',
      },
      {
        path: '/content/partnerships',
        name: 'list.partnerships',
        icon: 'TeamOutlined',
        component: './Content/Partnership',
      },
      {
        path: '/content/regulation-agencies',
        name: 'list.regulation-agencies',
        icon: 'TeamOutlined',
        component: './Content/RegulationAgency',
      },
      {
        path: '/content/videos',
        name: 'list.videos',
        icon: 'VideoCameraOutlined',
        component: './Content/Video',
      },
      {
        path: '/content/features',
        name: 'list.features',
        icon: 'PictureOutlined',
        component: './Content/Feature',
      },
    ],
  },
  {
    path: '/notifications',
    name: 'list.notifications',
    icon: 'BellOutlined',
    component: './Content/Notification',
  },
  // 财务管理
  {
    path: '/finance',
    name: 'list.finance',
    icon: 'WalletOutlined',
    routes: [
      {
        path: '/finance/exchanges',
        name: 'list.exchanges',
        Icon: 'SwapOutlined',
        component: './Finance/Exchange',
      },
      {
        path: '/finance/withdraws',
        name: 'list.withdraw',
        icon: 'WalletOutlined',
        component: './Finance/Withdraw',
      },
      {
        path: '/finance/transfers',
        name: 'list.transfers',
        icon: 'TransactionOutlined',
        component: './Finance/Transfer',
      },
      {
        path: '/finance/incomes',
        name: 'list.incomes',
        icon: 'MoneyCollectOutlined',
        component: './Finance/Income',
      },
      {
        path: '/finance/stackings',
        name: 'list.stackings',
        icon: 'MoneyCollectOutlined',
        component: './Finance/Stacking',
      },
    ],
  },
  {
    path: '/wallets',
    name: 'list.wallets',
    icon: 'WalletOutlined',
    routes: [
      {
        path: '/wallets/share',
        name: 'list.wallets.share',
        component: './Wallet/Wallet',
      },
      {
        path: '/wallets/index',
        name: 'list.wallets.formal',
        component: './Wallet/Formalities',
      },
    ],
  },

  // 用户管理
  {
    path: '/user-type',
    name: 'list.user-types',
    icon: 'UserOutlined',
    routes: [
      {
        path: '/user-type/proxies',
        name: 'list.proxies',
        icon: 'GlobalOutlined',
        component: './UserType/Proxy',
      },
      {
        path: '/user-type/employees',
        name: 'list.employees',
        icon: 'UsergroupAddOutlined',
        component: './UserType/Employee',
      },
      {
        path: '/user-type/customers',
        name: 'list.customers',
        icon: 'UserOutlined',
        component: './UserType/Customer',
      },
    ],
  },
  {
    path: '/records',
    name: 'list.records',
    icon: 'FileOutlined',
    component: './Record',
  },
  {
    path: '/chats',
    name: 'list.chats',
    icon: 'MessageOutlined',
    component: './Chat',
  },
  {
    path: '/customer-service',
    name: 'list.customer-service',
    icon: 'CustomerServiceOutlined',
    component: './CustomerService',
  },
];
