import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import attendxLogo from '../../assets/attendx-logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Login starts with brand on left. Other flows swap the brand to the right.
  const isLogin = location.pathname === '/login' || location.pathname === '/';
  const flexDirection = isLogin ? 'row' : 'row-reverse';

  // We wrap children in a motion.div to give it a nice fade-in key on mount.
  const formKey = location.pathname;

  return (
    <motion.div 
      className="auth-layout"
      style={{ flexDirection: flexDirection }}
      layout
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Brand Panel */}
      <motion.div 
        className="auth-left"
        layout
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}></div>
        
        <motion.div className="auth-left-content" layout="position" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="auth-logo">
            <img src={attendxLogo} alt="AttendX Logo" style={{ width: 32, height: 32, borderRadius: 6 }} />
            <span>AttendX</span>
          </div>
          <h1 className="auth-headline">Smarter Attendance. Better Insights.</h1>
          <p className="auth-subtitle">
            Manage students, faculty, schedules, and attendance from one powerful, modern platform designed for academic excellence.
          </p>
        </motion.div>
      </motion.div>

      {/* Form Panel */}
      <motion.div 
        className="auth-right"
        layout
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div 
          className="auth-form-container"
          key={formKey}
          initial={isClient ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AuthLayout;
