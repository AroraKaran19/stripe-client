import { useSearchParams } from "react-router-dom";

/**
 * Hook to get username from query parameters
 * Used in admin pages (/admin/*?user=username)
 * Returns the username from query params or null
 */
export const useUserFromRoute = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('user') || null;

  return {
    username,
    isUserAdmin: !!username,
  };
};
