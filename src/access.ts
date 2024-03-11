/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  console.log('currentUser', currentUser);
  return {
    canAdmin: currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'),
    canSuperAdmin: currentUser && currentUser.role === 'SUPER_ADMIN',
    canMerchant:
      currentUser && (currentUser.role === 'MERCHANT' || currentUser.role === 'SUPER_ADMIN'),
  };
}
