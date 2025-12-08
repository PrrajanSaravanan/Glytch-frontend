import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/staff/dashboard');
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
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Please enter your credentials to access the dashboard.</p>
          </div>
          
          <div className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="staff@hospital.com"
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" fullWidth>
            Log In
          </Button>
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