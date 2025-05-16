import { useState } from 'react';
import  Login  from './Login';
import  Registration  from './Registration';
import { motion, AnimatePresence } from 'framer-motion';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleAuth = () => {
    setIsLogin(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {isLogin ? (
              <Login onToggleAuth={toggleAuth} />
            ) : (
              <Registration />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthContainer;