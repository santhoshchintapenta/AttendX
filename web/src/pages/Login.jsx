import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.success) {
        const role = result.user?.role;
        // Students go directly to their dashboard — no workspace selection
        if (role === 'Student') {
          navigate('/attendance/dashboard');
        } else {
          navigate('/workspaces');
        }
      } else {
        setError(result?.message || 'Login failed.');
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
      title="Welcome back" 
      subtitle="Sign in to continue to AttendX."
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
            placeholder="name@university.edu"
            required 
          />
        </div>
        
        <div className="form-group">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </div>
          <input 
            type="password" 
            className="form-input"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required 
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
