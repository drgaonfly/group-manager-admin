const checkPermission = (currentUser: API.CurrentUser, path: string, action: string) => {
  return (
    currentUser &&
    currentUser.roles.some(
      (role: any) =>
        role.permissions &&
        !!role.permissions.find((item: any) => item.action === action && item.path === path),
    )
  );
};

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canSuperAdmin: currentUser && currentUser.isAdmin,

    canUpdateRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/roles/:id', 'PUT')),
    canCreateRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/roles', 'POST')),
    canDeleteRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/roles', 'DELETE')),
    canGetRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/roles', 'GET')),

    canUpdateUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users/:id', 'PUT')),
    canDeleteUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users', 'Delete')),
    canCreateUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users', 'POST')),
    canGetUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users', 'GET')),

    canUpdateMenu:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/menus/:id', 'PUT')),
    canDeleteMenu:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/menus', 'DELETE')),
    canCreateMenu:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/menus', 'POST')),
    canGetMenu:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/menus', 'GET')),

    canUpdatePermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permissions/:id', 'PUT')),
    canDeletePermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permissions', 'DELETE')),
    canCreatePermission:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/permissions', 'POST')),
    canGetPermission:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/permissions', 'GET')),

    canUpdateDataPermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/data-permissions/:id', 'PUT')),
    canDeleteDataPermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/data-permissions', 'DELETE')),
    canCreateDataPermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/data-permissions', 'POST')),
    canGetDataPermission:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/data-permissions', 'GET')),

    canCreatePermissionGroup:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permission-groups', 'POST')),
    canDeletePermissionGroup:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permission-groups', 'DELETE')),
    canUpdatePermissionGroup:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permission-groups/:id', 'PUT')),
    canGetPermissionGroup:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/permission-groups', 'GET')),

    //withdraws权限
    canCreateWithdraw:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdraws', 'POST')),
    canDeleteWithdraw:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdraws', 'DELETE')),
    canUpdateWithdraw:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdraws/:id', 'PUT')),
    canGetWithdraw:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdraws', 'GET')),
    canCheckWithdraw:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/withdraws/:id/check', 'PUT')),

    // proxy权限
    canCreateProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'POST')),
    canDeleteProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'DELETE')),
    canUpdateProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies/:id', 'PUT')),
    canGetProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'GET')),
    canGetProxyDetail:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users/:id', 'GET')),

    // employee权限
    canCreateEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'POST')),
    canDeleteEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'DELETE')),
    canUpdateEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees/:id', 'PUT')),
    canGetEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'GET')),
    canGetEmployeeDetail:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/users/:id', 'GET')),

    // customer权限
    canCreateCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'POST')),
    canDeleteCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'DELETE')),
    canUpdateCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers/:id', 'PUT')),
    canGetCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'GET')),

    // 机器人权限
    canCreateBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'POST')),
    canDeleteBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'DELETE')),
    canUpdateBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots/:id', 'PUT')),
    canGetBot: currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'GET')),

    // 机器人用户权限
    canCreateBotUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-users', 'POST')),
    canDeleteBotUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-users', 'DELETE')),
    canUpdateBotUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-users/:id', 'PUT')),
    canGetBotUser:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-users', 'GET')),

    // Transaction权限
    canCreateTransaction:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transactions', 'POST')),
    canDeleteTransaction:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/transactions', 'DELETE')),
    canUpdateTransaction:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/transactions/:id', 'PUT')),
    canGetTransaction:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transactions', 'GET')),

    // Group权限
    canCreateGroup:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/groups', 'POST')),
    canDeleteGroup:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/groups', 'DELETE')),
    canUpdateGroup:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/groups/:id', 'PUT')),
    canGetGroup:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/groups', 'GET')),

    // Subscription权限
    canCreateSubscription:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/subscriptions', 'POST')),
    canDeleteSubscription:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/subscriptions', 'DELETE')),
    canUpdateSubscription:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/subscriptions/:id', 'PUT')),
    canGetSubscription:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/subscriptions', 'GET')),

    // Payment权限
    canCreatePayment:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/payments', 'POST')),
    canDeletePayment:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/payments', 'DELETE')),
    canUpdatePayment:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/payments/:id', 'PUT')),
    canGetPayment:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/payments', 'GET')),

    // BotMessage
    canCreateBotMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-messages', 'POST')),
    canDeleteBotMessage:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/bot-messages', 'DELETE')),
    canUpdateBotMessage:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/bot-messages/:id', 'PUT')),
    canGetBotMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bot-messages', 'GET')),

    // Message
    canCreateMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/messages', 'POST')),
    canDeleteMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/messages', 'DELETE')),
    canUpdateMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/messages/:id', 'PUT')),
    canGetMessage:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/messages', 'GET')),

    // Wallet
    canCreateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'POST')),
    canDeleteWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'DELETE')),
    canUpdateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets/:id', 'PUT')),
    canGetWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'GET')),

    // Receipt
    canCreateReceipt:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/receipts', 'POST')),
    canDeleteReceipt:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/receipts', 'DELETE')),
    canUpdateReceipt:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/receipts/:id', 'PUT')),
    canGetReceipt:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/receipts', 'GET')),

    // Exchange
    canCreateExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'POST')),
    canDeleteExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'DELETE')),
    canUpdateExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges/:id', 'PUT')),
    canGetExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'GET')),
  };
}
