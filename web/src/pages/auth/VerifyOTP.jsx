import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AuthLayout from '../../components/layout/AuthLayout';
import { AlertCircle, Loader2, Check } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // Animation state: 'idle' | 'merging' | 'rotating' | 'success'
  const [animationPhase, setAnimationPhase] = useState('idle');
  
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerSuccessSequence = (resetToken) => {
    setAnimationPhase('merging');
    
    // Step 2: Rotate
    setTimeout(() => {
      setAnimationPhase('rotating');
      
      // Step 3: Success Tick
      setTimeout(() => {
        setAnimationPhase('success');
        
        // Final transition
        setTimeout(() => {
          navigate('/reset-password', { state: { resetToken } });
        }, 800);
      }, 400); // Wait for rotation
    }, 500); // Wait for merge
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (animationPhase !== 'idle') return;

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp: otpString });
      if (response.data.success) {
        triggerSuccessSequence(response.data.data.resetToken);
      } else {
        setError(response.data.message || 'Invalid verification code');
        setLoading(false);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending || animationPhase !== 'idle') return;
    
    setResending(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setTimer(60);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  // Determine container and input animations
  const containerVariants = {
    idle: { gap: '12px' },
    merging: { gap: '0px' },
    rotating: { gap: '0px', rotate: 360 },
    success: { gap: '0px', rotate: 360, opacity: 0, scale: 0.5 }
  };

  const inputVariants = {
    idle: { opacity: 1, borderColor: 'var(--border)', color: 'var(--text-primary)' },
    merging: { opacity: 0.5, borderColor: 'transparent', color: 'transparent', width: '20px' },
    rotating: { opacity: 0, borderColor: 'transparent', color: 'transparent', width: '0px' },
    success: { opacity: 0, width: '0px' }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit verification code to ${email || 'your email'}`}
    >
      <form onSubmit={handleSubmit} className="w-full">
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <div style={{ position: 'relative', height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
          <AnimatePresence>
            {animationPhase === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  zIndex: 10
                }}
              >
                <div style={{ width: '48px', height: '48px', backgroundColor: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}>
                  <Check color="white" size={24} strokeWidth={3} />
                </div>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ color: '#22C55E', fontWeight: 600, fontSize: '15px' }}
                >
                  OTP Verified
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="otp-container" 
            variants={containerVariants}
            animate={animationPhase}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ margin: 0, padding: 0 }}
          >
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-box"
                required
                disabled={animationPhase !== 'idle' || loading}
                variants={inputVariants}
                animate={animationPhase !== 'idle' ? animationPhase : (digit ? { scale: [1, 1.08, 1] } : { scale: 1 })}
                transition={{ duration: animationPhase !== 'idle' ? 0.5 : 0.2, type: animationPhase !== 'idle' ? 'tween' : 'spring', stiffness: 300, damping: 10 }}
                style={{
                  margin: 0,
                  backgroundColor: animationPhase !== 'idle' ? 'var(--primary)' : 'var(--surface)',
                  boxShadow: animationPhase !== 'idle' ? 'none' : undefined,
                }}
              />
            ))}
          </motion.div>
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading || animationPhase !== 'idle'}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>
        
        <div className="flex justify-center mt-6 text-sm" style={{ fontSize: '14px' }}>
          <span className="text-muted mr-1">Didn't receive a code?</span>
          <button 
            type="button" 
            onClick={handleResend}
            disabled={timer > 0 || resending || animationPhase !== 'idle'}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: timer > 0 ? 'var(--text-muted)' : 'var(--primary)', 
              cursor: timer > 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              padding: 0,
              fontSize: '14px',
              transition: 'color 200ms'
            }}
          >
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyOTP;
