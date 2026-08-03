'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials, setAdmin } from '@/lib/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin, getAdminMe } from '@/lib/api/auth.api';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Login
      const loginRes = await adminLogin({ email, password });

      if (!loginRes.success) {
        toast.error(loginRes.message || 'Login failed');
        return;
      }

      const { token, admin } = loginRes.data;

      // Step 2: Fetch full admin profile
      let adminProfile = admin;
      try {
        const meRes = await getAdminMe();
        if (meRes.success) {
          adminProfile = meRes.data;
        }
      } catch {
        // Use admin from login response if /me fails
      }

      // Step 3: Store in Redux
      dispatch(setCredentials({ admin: adminProfile, token }));
      dispatch(setAdmin(adminProfile));

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">R</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Welcome to Resvor</h2>
        <p className="text-muted-foreground">Sign in to your admin account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@resvor.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 text-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
};

export default Login;
