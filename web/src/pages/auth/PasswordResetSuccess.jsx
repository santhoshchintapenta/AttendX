import { useNavigate } from 'react-router-dom';

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-form" style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#E6F4EA', 
          borderRadius: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h2>Password updated!</h2>
        <p style={{ marginBottom: '30px', color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        
        <button 
          onClick={() => navigate('/login')} 
          className="login-button"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
