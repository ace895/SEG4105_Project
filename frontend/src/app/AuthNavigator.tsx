import React, { useState } from 'react';
import SignUp from './SignUp';
import Login from './Login';
import TwoFactorAuth from './TwoFactorAuth';

type AuthScreen = 'login' | 'signup' | '2fa';

interface AuthNavigatorProps {
  onAuthSuccess?: () => void;
}

export default function AuthNavigator({ onAuthSuccess }: AuthNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentScreen('2fa');
  };

  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentScreen('login');
  };

  const handleVerificationSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleResendCode = async () => {
  };

  if (currentScreen === 'signup') {
    return (
      <SignUp
        onNavigateToLogin={() => setCurrentScreen('login')}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  if (currentScreen === '2fa') {
    return (
      <TwoFactorAuth
        email={userEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onResendCode={handleResendCode}
      />
    );
  }

  return (
    <Login
      onNavigateToSignUp={() => setCurrentScreen('signup')}
      onLoginSuccess={handleLoginSuccess}
      onForgotPassword={() => {}}
    />
  );
}
