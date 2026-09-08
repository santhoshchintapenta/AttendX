import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import AuthLayout from '../../components/layout/AuthLayout';
import { AlertCircle, Loader2, Check } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword });
      if (response.data.success) {
        navigate('/login'); // Should realistically go to a success page, but login is fine
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isLengthValid = newPassword.length >= 8;
  const isMatchValid = newPassword === confirmPassword && newPassword.length > 0;

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a strong password to secure your AttendX account."
    >
      <form onSubmit={handleSubmit} className="w-full">
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            className="form-input"
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            placeholder="At least 8 characters"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            className="form-input"
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            placeholder="Repeat new password"
          />
        </div>

        <div className="mb-6 flex flex-col gap-2" style={{ fontSize: '13px' }}>
          <div className="flex items-center gap-2" style={{ color: isLengthValid ? 'var(--success)' : 'var(--text-muted)' }}>
            <Check size={14} />
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: isMatchValid ? 'var(--success)' : 'var(--text-muted)' }}>
            <Check size={14} />
            <span>Passwords match</span>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading || !isLengthValid || !isMatchValid}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
