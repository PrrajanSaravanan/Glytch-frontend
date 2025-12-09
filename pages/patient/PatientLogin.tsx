import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const PatientLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.emailOrPhone.trim()) {
      setError(`Please enter your ${loginMethod}`);
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }

    // Validate email or phone format
    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.emailOrPhone.replace(/\D/g, ''))) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
    }

    // Simulate login - store patient data in session/localStorage
    sessionStorage.setItem('patientName', formData.name);
    sessionStorage.setItem('patientEmail', formData.emailOrPhone);
    
    // Navigate to doctor list
    navigate('/patient/doctors');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-4xl">Q</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Portal</h1>
      </div>

      <Card className="w-full max-w-sm p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Welcome</h2>
            <p className="text-slate-500 text-sm">Please log in to access the queue management system.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* Toggle between email and phone */}
            <div>
              <div className="flex gap-3 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="email"
                    checked={loginMethod === 'email'}
                    onChange={() => setLoginMethod('email')}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-slate-700">Email</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="phone"
                    checked={loginMethod === 'phone'}
                    onChange={() => setLoginMethod('phone')}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-slate-700">Phone</span>
                </label>
              </div>

              <Input
                label={loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                type={loginMethod === 'email' ? 'email' : 'tel'}
                name="emailOrPhone"
                placeholder={loginMethod === 'email' ? 'patient@example.com' : '(123) 456-7890'}
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" fullWidth>
            Log In
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">
                Sign up
              </span>
            </p>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-sm text-slate-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>
          ← Back to Role Selection
        </span>
      </p>
    </div>
  );
};
