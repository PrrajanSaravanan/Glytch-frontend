import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabaseAuthService } from '../../src/services/supabaseAuthService';
import { supabaseService } from '../../src/services/supabaseService';

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginAsDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      loginWithSupabase('doctor');
    }
  };

  const handleLoginAsStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      loginWithSupabase('staff');
    }
  };

  const loginWithSupabase = async (role: 'doctor' | 'staff') => {
    setLoading(true);
    try {
      // Authenticate user
      const user = await supabaseAuthService.login(email, password);

      // Query Supabase to check if user has the requested role
      const { data: staffDocs, error: queryError } = await supabaseService.supabase
        .from(role === 'doctor' ? 'doctors' : 'staff')
        .select('*')
        .eq('id', user.id);

      if (queryError) throw queryError;

      if (!staffDocs || staffDocs.length === 0) {
        setErrors({ 
          general: `You don't have access as a ${role}. Please contact administration.` 
        });
        await supabaseAuthService.logout();
        setLoading(false);
        return;
      }

      // Store staff info in session
      sessionStorage.setItem('staffUID', user.id);
      sessionStorage.setItem('staffEmail', user.email || '');
      sessionStorage.setItem('staffRole', role);
      sessionStorage.setItem('staffData', JSON.stringify(staffDocs[0]));

      // Navigate based on role
      navigate(role === 'doctor' ? '/staff/dashboard' : '/staff/staff-page');
    } catch (err) {
      setErrors({ 
        general: (err as Error).message 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">Q</span>
         </div>
         <h1 className="text-2xl font-bold text-slate-900">Staff Portal</h1>
      </div>

      <Card className="w-full max-w-sm p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm">Please enter your credentials to access the portal.</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <Input 
              label="Email Address *" 
              type="email" 
              placeholder="email@hospital.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              required
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Input 
              label="Password *" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              required
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleLoginAsDoctor}
            fullWidth
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login as Doctor'}
          </Button>
          <Button 
            onClick={handleLoginAsStaff}
            fullWidth
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Logging in...' : 'Login as Staff'}
          </Button>
        </div>
      </Card>
      
      <p className="mt-6 text-sm text-slate-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>
          ← Back to Role Selection
        </span>
      </p>
    </div>
  );
};