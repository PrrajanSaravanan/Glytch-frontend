import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const PatientSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = value.replace(/\D/g, '');
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(value) || phoneRegex.test(phoneDigits);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.emailOrPhone.trim()) {
      setError('Please enter email or phone');
      return;
    }
    if (!validateEmailOrPhone(formData.emailOrPhone.trim())) {
      setError('Please enter a valid email or 10-digit phone number');
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      setError('Please enter a password (min 6 characters)');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Persist user to localStorage (simple mock)
    try {
      const stored = localStorage.getItem('patients');
      const patients = stored ? JSON.parse(stored) : [];
      
      // Check if user already exists
      const userExists = patients.some(
        (p: any) => p.contact === formData.emailOrPhone.trim()
      );
      
      if (userExists) {
        setError('This email or phone is already registered');
        return;
      }

      const newPatient = {
        id: `p-${Date.now()}`,
        name: formData.name.trim(),
        contact: formData.emailOrPhone.trim(),
        password: formData.password,
      };
      patients.push(newPatient);
      localStorage.setItem('patients', JSON.stringify(patients));

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/patient/login');
      }, 1500);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-4xl">Q</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create Patient Account</h1>
      </div>

      <Card className="w-full max-w-sm p-8">
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Sign Up</h2>
            <p className="text-slate-500 text-sm">Create a new patient account to access the queue management system.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
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
            <Input
              label="Email or Phone"
              type="text"
              name="emailOrPhone"
              placeholder="patient@example.com or 1234567890"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" fullWidth>
            Create Account
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate('/patient/login')}
              >
                Log in
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
