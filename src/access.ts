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
    canCustomer: currentUser && currentUser.role === ROLES.Customer,
    canOrderClerk: currentUser && currentUser.role === ROLES.OrderClerk,
    canFinancialStaff: currentUser && currentUser.role === ROLES.FinancialStaff,
    canAdmin: currentUser && currentUser.role === ROLES.Admin,
  };
}
