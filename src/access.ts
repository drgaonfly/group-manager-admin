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
    // 一键归集权限
    canCollection:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/transfers/collection', 'POST')),

    // member权限
    canCreateMember:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/members', 'POST')),
    canDeleteMember:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/members', 'DELETE')),
    canUpdateMember:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/members/:id', 'PUT')),
    canGetMember:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/members', 'GET')),

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

    canCreateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'POST')),
    canDeleteWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'DELETE')),
    canUpdateWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets/:id', 'PUT')),
    canGetWallet:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/wallets', 'GET')),

    //轮播图管理权限
    canCreateCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousels', 'POST')),
    canDeleteCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousels', 'DELETE')),
    canUpdateCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousels/:id', 'PUT')),
    canGetCarousel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/carousels', 'GET')),

    // stacking 权限
    canCreateStacking:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/stackings', 'POST')),
    canDeleteStacking:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/stackings', 'DELETE')),
    canUpdateStacking:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/stackings/:id', 'PUT')),
    canGetStacking:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/stackings', 'GET')),

    // proxy commission records权限
    canCreateProxyCommissionRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/proxy-commission-records', 'POST')),
    canDeleteProxyCommissionRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/proxy-commission-records', 'DELETE')),
    canUpdateProxyCommissionRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/proxy-commission-records/:id', 'PUT')),
    canGetProxyCommissionRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/proxy-commission-records', 'GET')),

    // wallet deal records权限
    canCreateWalletDealRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/wallet-deal-records', 'POST')),
    canDeleteWalletDealRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/wallet-deal-records', 'DELETE')),
    canUpdateWalletDealRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/wallet-deal-records/:id', 'PUT')),
    canGetWalletDealRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/wallet-deal-records', 'GET')),

    // questions 权限
    canCreateQuestion:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/questions', 'POST')),
    canDeleteQuestion:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/questions', 'DELETE')),
    canUpdateQuestion:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/questions/:id', 'PUT')),
    canGetQuestion:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/questions', 'GET')),

    // activity  权限
    canCreateActivity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/activities', 'POST')),
    canDeleteActivity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/activities', 'DELETE')),
    canUpdateActivity:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/activities/:id', 'PUT')),
    canGetActivity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/activities', 'GET')),

    // release-records权限
    canCreateReleaseRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/release-records', 'POST')),
    canDeleteReleaseRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/release-records', 'DELETE')),
    canUpdateReleaseRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/release-records/:id', 'PUT')),
    canGetReleaseRecord:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/release-records', 'GET')),

    // exchange 权限
    canCreateExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'POST')),
    canDeleteExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'DELETE')),
    canUpdateExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges/:id', 'PUT')),
    canGetExchange:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/exchanges', 'GET')),

    // income 权限
    canCreateIncome:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/incomes', 'POST')),
    canDeleteIncome:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/incomes', 'DELETE')),
    canUpdateIncome:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/incomes/:id', 'PUT')),
    canGetIncome:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/incomes', 'GET')),

    // transfer 权限
    canCreateTransfer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transfers', 'POST')),
    canDeleteTransfer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transfers', 'DELETE')),
    canUpdateTransfer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transfers/:id', 'PUT')),
    canGetTransfer:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/transfers', 'GET')),

    // channel 权限
    canCreateChannel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/channels', 'POST')),
    canDeleteChannel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/channels', 'DELETE')),
    canUpdateChannel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/channels/:id', 'PUT')),
    canGetChannel:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/channels', 'GET')),

    // notice 权限
    canCreateNotice:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/notices', 'POST')),
    canDeleteNotice:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/notices', 'DELETE')),
    canUpdateNotice:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/notices/:id', 'PUT')),
    canGetNotice:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/notices', 'GET')),

    // partnership 权限
    canCreatePartnership:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/partnerships', 'POST')),
    canDeletePartnership:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/partnerships', 'DELETE')),
    canUpdatePartnership:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/partnerships/:id', 'PUT')),
    canGetPartnership:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/partnerships', 'GET')),

    // regulation-agencicy 权限
    canCreateRegulationAgency:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/regulation-agencies', 'POST')),
    canDeleteRegulationAgency:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/regulation-agencies', 'DELETE')),
    canUpdateRegulationAgency:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/regulation-agencies/:id', 'PUT')),
    canGetRegulationAgency:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/regulation-agencies', 'GET')),

    // setting 权限
    canCreateSetting:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/settings', 'POST')),
    canDeleteSetting:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/settings', 'DELETE')),
    canUpdateSetting:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/settings/:id', 'PUT')),
    canGetSetting:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/settings', 'GET')),

    // mining-data 权限
    canCreateMiningData:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/mining-data', 'POST')),
    canDeleteMiningData:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/mining-data', 'DELETE')),
    canUpdateMiningData:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/mining-data/:id', 'PUT')),
    canGetMiningData:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/mining-data', 'GET')),

    // mining-output 权限
    canCreateMiningOutput:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/mining-output', 'POST')),
    canDeleteMiningOutput:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/mining-output', 'DELETE')),
    canUpdateMiningOutput:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/mining-output/:id', 'PUT')),
    canGetMiningOutput:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/mining-output', 'GET')),

    // notification 权限
    canCreateNotification:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/notifications', 'POST')),
    canDeleteNotification:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/notifications', 'DELETE')),
    canUpdateNotification:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/notifications/:id', 'PUT')),
    canGetNotification:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/notifications', 'GET')),

    // video 权限
    canCreateVideo:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/videos', 'POST')),
    canDeleteVideo:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/videos', 'DELETE')),
    canUpdateVideo:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/videos/:id', 'PUT')),
    canGetVideo:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/videos', 'GET')),

    // liquidity 权限
    canCreateLiquidity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/liquidity', 'POST')),
    canDeleteLiquidity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/liquidity', 'DELETE')),
    canUpdateLiquidity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/liquidity/:id', 'PUT')),
    canGetLiquidity:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/liquidity', 'GET')),

    // customer service 权限
    canGetCustomerService:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/customer-service', 'GET')),
  };
}
