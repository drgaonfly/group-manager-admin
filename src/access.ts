// export const ROLES = {
//   SuperAdmin: 'SUPER_ADMIN',
//   Admin: 'ADMIN',
//   Customer: 'CUSTOMER',
//   OrderPlacer: 'ORDER_PLACER', // New role for placing orders
//   Reviewer: 'REVIEWER', // New role for reviewing orders
//   CustomerService: 'CUSTOMER_SERVICE', // New role for customer service
// } as const;

const checkPermission = (currentUser: API.CurrentUser, action: string, path: string) => {
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

    canCreateBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'POST')),
    canDeleteBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'DELETE')),
    canUpdateBot:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots/:id', 'PUT')),
    canGetBot: currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bots', 'GET')),

    canCreateBill:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bills', 'POST')),
    canDeleteBill:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bills', 'DELETE')),
    canUpdateBill:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bills/:id', 'PUT')),
    canGetBill:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/bills', 'GET')),

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

    canCreateResume:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/resumes', 'POST')),
    canDeleteResume:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/resumes', 'DELETE')),
    canUpdateResume:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/resumes/:id', 'PUT')),
    canGetResume:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/resumes', 'GET')),

    canCreateWithdrawal:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdrawals', 'POST')),
    canDeleteWithdrawal:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/withdrawals', 'DELETE')),
    canUpdateWithdrawal:
      currentUser &&
      (currentUser.isAdmin || checkPermission(currentUser, '/withdrawals/:id', 'PUT')),
    canGetWithdrawal:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/withdrawals', 'GET')),

    // proxy权限
    canCreateNewRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/new-roles', 'POST')),
    canDeleteNewRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/new-roles', 'DELETE')),
    canUpdateNewRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/new-roles/:id', 'PUT')),
    canGetNewRole:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/new-roles', 'GET')),

    // employee权限
    canCreateNewEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'POST')),
    canDeleteNewEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'DELETE')),
    canUpdateNewEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees/:id', 'PUT')),
    canGetNewEmployee:
      currentUser && (currentUser.isAdmin || checkPermission(currentUser, '/employees', 'GET')),
  };
}

// export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
//   const { currentUser } = initialState ?? {};

//   return {
//     canSuperAdmin: currentUser && currentUser.role === ROLES.SuperAdmin,

//     // Check if the user is either in the specific role or a SuperAdmin for broader access
//     canCustomer:
//       currentUser &&
//       (currentUser.role === ROLES.Customer ||
//         currentUser.role === ROLES.Admin ||
//         currentUser.role === ROLES.SuperAdmin),

//     canCustomerService:
//       currentUser &&
//       (currentUser.role === ROLES.CustomerService ||
//         currentUser.role === ROLES.Admin ||
//         currentUser.role === ROLES.SuperAdmin),

//     canAdmin:
//       currentUser && (currentUser.role === ROLES.Admin || currentUser.role === ROLES.SuperAdmin),
//   };
// }
