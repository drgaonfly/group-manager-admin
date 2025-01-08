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

    // proxy权限
    canCreateProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'POST')),
    canDeleteProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'DELETE')),
    canUpdateProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies/:id', 'PUT')),
    canGetProxy:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/proxies', 'GET')),

    // employee权限
    canCreateEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'POST')),
    canDeleteEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'DELETE')),
    canUpdateEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees/:id', 'PUT')),
    canGetEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'GET')),

    // customer权限
    canCreateCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'POST')),
    canDeleteCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'DELETE')),
    canUpdateCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers/:id', 'PUT')),
    canGetCustomer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/customers', 'GET')),

    //Topic权限
    canCreateTopic:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/topics', 'POST')),
    canDeleteTopic:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/topics', 'DELETE')),
    canUpdateTopic:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/topics/:id', 'PUT')),
    canGetTopic:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/topics', 'GET')),

    //Record权限
    canCreateRecord:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/records', 'POST')),
    canDeleteRecord:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/records', 'DELETE')),
    canUpdateRecord:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/records/:id', 'PUT')),
    canGetRecord:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/records', 'GET')),

    //Answers权限
    canCreateAnswer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/answers', 'POST')),
    canDeleteAnswer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/answers', 'DELETE')),
    canUpdateAnswer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/answers/:id', 'PUT')),
    canGetAnswer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/answers', 'GET')),

    // Instructions权限
    canCreateInstruction:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/instructions', 'POST')),
    canDeleteInstruction:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/instructions', 'DELETE')),
    canUpdateInstruction:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/instructions/:id', 'PUT')),
    canGetInstruction:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/instructions', 'GET')),

    canCreateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'POST')),
    canDeleteWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'DELETE')),
    canUpdateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets/:id', 'PUT')),
    canGetWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'GET')),

    // transaction权限
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

    //轮播图权限
    canCreateCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousel', 'POST')),
    canDeleteCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousel', 'DELETE')),
    canUpdateCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousel/:id', 'PUT')),
    canGetCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousel', 'GET')),
  };
}
