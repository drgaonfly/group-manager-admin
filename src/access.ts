export const ROLES = {
  SuperAdmin: 'SUPER_ADMIN',
  Admin: 'ADMIN', // Added Admin role
  Customer: 'CUSTOMER',
  OrderClerk: 'ORDER_CLERK',
  FinancialStaff: 'FINANCIAL_STAFF',
} as const;

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  return {
    canSuperAdmin: currentUser && currentUser.role === ROLES.SuperAdmin,
    // Check if the user is either in the specific role or a SuperAdmin for broader access
    canCustomer:
      currentUser &&
      (currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin),
    canOrderClerk:
      currentUser &&
      (currentUser.role === ROLES.OrderClerk || currentUser.role === ROLES.SuperAdmin),
    canFinancialStaff:
      currentUser &&
      (currentUser.role === ROLES.FinancialStaff || currentUser.role === ROLES.SuperAdmin),
    canAdmin:
      currentUser && (currentUser.role === ROLES.Admin || currentUser.role === ROLES.SuperAdmin),
  };
}
