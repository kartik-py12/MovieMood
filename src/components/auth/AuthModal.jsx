import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  return mode === 'login' ? (
    <LoginModal 
      isOpen={isOpen} 
      onClose={onClose} 
      switchToRegister={() => setMode('register')} 
    />
  ) : (
    <RegisterModal 
      isOpen={isOpen} 
      onClose={onClose} 
      switchToLogin={() => setMode('login')} 
    />
  );
};

export default AuthModal;
