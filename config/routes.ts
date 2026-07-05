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
    path: '/webapp',
    layout: false,
    routes: [
      {
        name: 'webapp-login',
        path: '/webapp/login',
        component: './Webapp/Login',
      },
    ],
  },
  {
    path: '/public/bots/:id/:username',
    layout: false,
    component: './Public/BotGroups',
  },
  {
    path: '/',
    component: './Welcome',
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
    path: '/account/function-config',
    // hideInMenu: true,
    name: 'list.function-config',
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
    path: '/bots',
    name: 'list.bots',
    icon: 'TableOutlined',
    component: './Bot',
  },
  {
    path: '/bot-users',
    name: 'list.bot-users',
    icon: 'RobotOutlined',
    component: './BotUser',
  },
  // transaction
  {
    path: '/transactions',
    name: 'list.transactions',
    icon: 'MoneyCollectOutlined',
    component: './Transaction',
  },
  // group
  {
    path: '/groups',
    name: 'list.groups',
    icon: 'TeamOutlined',
    component: './Group',
  },
  // suscription
  {
    path: '/subscriptions',
    name: 'list.subscriptions',
    icon: 'PayCircleOutlined',
    component: './Subscription',
  },
  // payment
  {
    path: '/payments',
    name: 'list.payments',
    icon: 'OrderedListOutlined',
    component: './Payment',
  },
  // botMessage
  {
    path: '/bot-messages',
    name: 'list.bot-messages',
    icon: 'MessageOutlined',
    component: './BotMessage',
  },
  // message
  {
    path: '/messages',
    name: 'list.messages',
    icon: 'MessageOutlined',
    component: './Message',
  },
  //
  {
    path: '/authorizations',
    name: 'list.authorizations',
    icon: 'TableOutlined',
    component: './Authorization',
  },

  {
    path: '/bots/:id/:username',
    layout: false,
    component: './index',
  },
  {
    path: '/bots/:id',
    layout: false,
    component: './index',
  },

  // wallet
  {
    path: '/wallets',
    name: 'list.wallets',
    icon: 'WalletOutlined',
    component: './Wallet',
  },
  // receipt
  {
    path: '/receipts',
    name: 'list.receipts',
    icon: 'MoneyCollectOutlined',
    component: './Receipt',
  },
  // exchange
  {
    path: '/exchanges',
    name: 'list.exchanges',
    icon: 'SwapOutlined',
    component: './Exchange',
  },
  // groupMessage
  {
    path: '/group-messages',
    name: 'list.group-messages',
    icon: 'MessageOutlined',
    component: './GroupMessage',
  },
  // botUserMessage
  {
    path: '/bot-user-messages',
    name: 'list.bot-user-messages',
    icon: 'MessageOutlined',
    component: './BotUserMessage',
  },
  // botUserConfig
  {
    path: '/bot-user-configs',
    name: 'list.bot-user-configs',
    icon: 'SettingOutlined',
    component: './BotUserConfig',
  },
  // promotion link
  {
    path: '/promotion-links',
    name: 'list.promotion-links',
    icon: 'LinkOutlined',
    component: './PromotionLink',
  },
  {
    path: '/channel-posts',
    name: 'list.channel-posts',
    icon: 'AppstoreOutlined',
    component: './ChannelPost',
  },
  // reply rule (回复规则)
  {
    path: '/reply-rules',
    name: 'list.reply-rules',
    icon: 'KeyOutlined',
    component: './ReplyRule',
    access: 'canGetReplyRule',
  },
  {
    path: '/recharges',
    name: 'list.recharges',
    icon: 'MoneyCollectOutlined',
    component: './Recharge',
  },
  {
    path: '/posts',
    name: 'list.posts',
    icon: 'FileTextOutlined',
    component: './Post',
  },
  {
    path: '/red-packets',
    name: 'list.red-packets',
    icon: 'RedEnvelopeOutlined',
    component: './RedPacket',
  },
];
