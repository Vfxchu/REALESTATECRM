import * as React from 'react';
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const Auth: React.FC = () => {
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Sign up mode states
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Force light theme on the login page
  useEffect(() => {
    const root = document.documentElement;
    const previous = new Set(root.classList);
    root.classList.remove('dark', 'dark-blue');
    root.classList.add('light');
    return () => {
      root.classList.remove('light');
      root.classList.remove('dark', 'dark-blue');
      previous.forEach((c) => root.classList.add(c));
    };
  }, []);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      if (loginData.password !== confirmPassword) {
        toast({
          title: 'Passwords mismatch',
          description: 'Passwords do not match. Please verify and try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      try {
        const { error } = await signup(loginData.email, loginData.password, name);
        if (!error) {
          toast({
            title: 'Account created successfully!',
            description: 'Check your email to verify your account, then sign in.',
          });
          setIsSignUp(false);
          setLoginData({ ...loginData, password: '' });
          setConfirmPassword('');
        } else {
          toast({
            title: 'Signup failed',
            description: error.message || 'Please check your inputs and try again.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        toast({
          title: 'Signup failed',
          description: err.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } else {
      try {
        const { error } = await login(loginData.email, loginData.password);
        if (!error) {
          toast({
            title: 'Welcome back!',
            description: 'You have been logged in successfully.',
          });
        } else {
          toast({
            title: 'Login failed',
            description: error.message || 'Invalid email or password.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Login failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetLoading(true);
    
    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo,
      });

      if (!error) {
        toast({
          title: 'Check your email',
          description: 'We sent a link to reset your password.',
        });
        setForgotOpen(false);
        setForgotEmail('');
      }
    } catch (error) {
      // Silently handle errors
    }
    
    setResetLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#161D2D] flex flex-col items-center justify-center p-4 light">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/lovable-uploads/92146f7d-7396-400a-8bf4-92d1603d8ea5.png"
            alt="DKV International Logo"
            className="w-28 md:w-32 lg:w-36 h-auto"
          />
          <div className="mt-3 font-heading text-white font-semibold tracking-wide text-xl md:text-2xl">
            DKV INTERNATIONAL REAL ESTATE CRM
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Sign up to start using the CRM' : 'Sign in to access your CRM dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Password</Label>
                  {!isSignUp && (
                    <Button 
                      type="button" 
                      variant="link" 
                      className="px-0 h-auto text-xs font-normal text-muted-foreground hover:text-primary"
                      onClick={() => setForgotOpen(true)}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {isSignUp && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {!isSignUp ? (
                  <>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                      onClick={() => {
                        setIsSignUp(true);
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                      onClick={() => {
                        setIsSignUp(false);
                        setLoginData({ ...loginData, password: '' });
                        setConfirmPassword('');
                      }}
                    >
                      Sign In
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Creating...' : 'Sign Up'}
                    </Button>
                  </>
                )}
              </div>
            </form>

            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset your password</DialogTitle>
                  <DialogDescription>
                    Enter your email and we'll send you a reset link.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
