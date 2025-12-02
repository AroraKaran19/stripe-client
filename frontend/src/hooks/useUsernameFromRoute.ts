import { useParams } from "react-router-dom";

/**
 * Hook to get username from route parameters
 * - If route is /:username, returns the username from params
 * - If route is / (root), returns null (will use default homepage from API)
 * 
 * Usage:
 * - /karan → returns "karan"
 * - / → returns null (API will return default homepage)
 */
export const useUsernameFromRoute = (): string | null => {
  const params = useParams<{ username?: string }>();
  
  // If username param exists, use it; otherwise return null to use default
  return params.username || null;
};

