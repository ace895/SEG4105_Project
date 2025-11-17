import React, { useState, useEffect } from 'react';
import { Redirect } from "expo-router";
import AuthNavigator from './AuthNavigator';
import Dashboard from './Dashboard';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthNavigator onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}
