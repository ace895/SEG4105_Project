import React from "react";
import AuthNavigator from "./AuthNavigator";
import Dashboard from "./dashboard";
import { useUser } from "../context/UserContext";

export default function Index() {
  const { email } = useUser();

  // If no logged-in email, show login/signup pages
  if (!email) {
    return <AuthNavigator />;
  }

  // Otherwise, user is authenticated → show dashboard
  return <Dashboard />;
}
