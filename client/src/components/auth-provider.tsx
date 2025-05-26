import { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAuthToken } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    // Set up axios interceptor for auth token
    const token = getAuthToken();
    if (token) {
      // Override the default fetch to include auth header
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const [url, config = {}] = args;
        const headers = new Headers(config.headers);
        headers.set('Authorization', `Bearer ${token}`);
        
        return originalFetch(url, {
          ...config,
          headers,
        });
      };
    }
  }, [auth.isAuthenticated]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
