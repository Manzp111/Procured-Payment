import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "../Api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return setIsAllowed(false);

      try {
        const { exp } = jwtDecode<{ exp: number }>(accessToken);

        if (Date.now() >= exp * 1000) {
          const newToken = await refreshAccessToken();
          if (!newToken) return setIsAllowed(false);
        }

        setIsAllowed(true);
      } catch {
        setIsAllowed(false);
      }
    };

    checkAuth();
  }, []);

  if (isAllowed === null) return <div>Loading...</div>;
  if (!isAllowed) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
