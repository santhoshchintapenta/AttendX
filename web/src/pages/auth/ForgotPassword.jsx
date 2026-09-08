import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import AuthLayout from '../../components/layout/AuthLayout';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered email address and we'll send you a verification code."
    >
      <form onSubmit={handleSubmit} className="w-full">
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="name@university.edu"
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Send Verification Code'
          )}
        </button>
        
        <div className="flex justify-center mt-6">
          <Link to="/login" className="flex items-center gap-2 text-muted hover:text-primary" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 200ms' }}>
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
