export const ROLES = {
  SuperAdmin: 'SUPER_ADMIN',
  Admin: 'ADMIN',
  Customer: 'CUSTOMER',
  OrderPlacer: 'ORDER_PLACER', // New role for placing orders
  Reviewer: 'REVIEWER', // New role for reviewing orders
  CustomerService: 'CUSTOMER_SERVICE', // New role for customer service
} as const;

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  return {
    canSuperAdmin: currentUser && currentUser.role === ROLES.SuperAdmin,

    canSeeTasks:
      currentUser &&
      (currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.OrderPlacer ||
        currentUser.role === ROLES.Reviewer ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.SuperAdmin),

    canSeeBills:
      currentUser &&
      (currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.OrderPlacer ||
        currentUser.role === ROLES.Reviewer ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.SuperAdmin),

    canSeeEmptyPackages:
      currentUser &&
      (currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.SuperAdmin),

    canSeeAccountLibrary:
      currentUser &&
      (currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.SuperAdmin),

    canSeeAssignmentRecords:
      currentUser &&
      (currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.SuperAdmin ||
        currentUser.role === ROLES.OrderPlacer),

    canSeeAfterSalesOrders:
      currentUser &&
      (currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.OrderPlacer ||
        currentUser.role === ROLES.SuperAdmin ||
        currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Reviewer),

    canSeeCourses:
      currentUser &&
      (currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin ||
        currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.OrderPlacer ||
        currentUser.role === ROLES.Reviewer),

    // Check if the user is either in the specific role or a SuperAdmin for broader access
    canCustomer:
      currentUser &&
      (currentUser.role === ROLES.Customer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin),

    canOrderPlacer:
      currentUser &&
      (currentUser.role === ROLES.OrderPlacer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin),

    canReviewer:
      currentUser &&
      (currentUser.role === ROLES.Reviewer ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin),

    canCustomerService:
      currentUser &&
      (currentUser.role === ROLES.CustomerService ||
        currentUser.role === ROLES.Admin ||
        currentUser.role === ROLES.SuperAdmin),

    canAdmin:
      currentUser && (currentUser.role === ROLES.Admin || currentUser.role === ROLES.SuperAdmin),
    canEditUsers:
      currentUser && (currentUser.role === ROLES.SuperAdmin || currentUser.role === ROLES.Admin),
    isCustomerService: currentUser && currentUser.role === ROLES.CustomerService,
    isSuperAdmin: currentUser && currentUser.role === ROLES.SuperAdmin,
    isOrderPlacer: currentUser && currentUser.role === ROLES.OrderPlacer,
    isReviewer: currentUser && currentUser.role === ROLES.Reviewer,
  };
}
