// Development bypass utility
export const isDevBypassEnabled = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';
  return isDevelopment && bypassAuth;
};