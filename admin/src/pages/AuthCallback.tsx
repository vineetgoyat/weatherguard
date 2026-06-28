import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    console.log('Token from URL:', token);
    
    if (token) {
      login(token).then(() => {
        navigate('/dashboard', { replace: true });
      }).catch((err) => {
        console.error('Login error:', err);
        navigate('/', { replace: true });
      });
    } else {
      console.error('No token in URL');
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}