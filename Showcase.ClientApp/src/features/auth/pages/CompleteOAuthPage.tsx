import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CompleteOAuthPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/register?oauth=google", { replace: true });
  }, [navigate]);

  return null;
};
