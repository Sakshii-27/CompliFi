"use client";
import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

type FormErrors = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
};

type LoginData = {
  email: string;
  password: string;
};

type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type SuccessType = 'login' | 'signup' | 'forgot';

// Login Page Component
const LoginPage = ({ 
  loginData, 
  errors, 
  showPassword, 
  isLoading, 
  handleLoginChange, 
  handleLogin, 
  setShowPassword, 
  setCurrentPage, 
  resetForms 
}: {
  loginData: LoginData;
  errors: FormErrors;
  showPassword: boolean;
  isLoading: boolean;
  handleLoginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (e: React.FormEvent) => void;
  setShowPassword: (show: boolean) => void;
  setCurrentPage: (page: 'login' | 'signup' | 'forgot' | 'success') => void;
  resetForms: () => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>
        
        <form className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm space-y-6" onSubmit={handleLogin}>
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{errors.general}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 text-white focus:ring-1 focus:outline-none ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="Enter your email"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 pr-12 text-white focus:ring-1 focus:outline-none ${
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="Enter your password"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2" />
              <span className="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setCurrentPage('forgot')}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-400">Don't have an account? </span>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('signup');
                resetForms();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Signup Page Component
const SignupPage = ({ 
  signupData, 
  errors, 
  showPassword, 
  showConfirmPassword, 
  isLoading, 
  handleSignupChange, 
  handleSignup, 
  setShowPassword, 
  setShowConfirmPassword, 
  setCurrentPage, 
  resetForms 
}: {
  signupData: SignupData;
  errors: FormErrors;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  handleSignupChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignup: (e: React.FormEvent) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setCurrentPage: (page: 'login' | 'signup' | 'forgot' | 'success') => void;
  resetForms: () => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400">Join us and start your compliance journey</p>
        </div>
        
        <form className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm space-y-6" onSubmit={handleSignup}>
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{errors.general}</span>
            </div>
          )}
          
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="signup-firstName" className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                id="signup-firstName"
                type="text"
                name="firstName"
                value={signupData.firstName}
                onChange={handleSignupChange}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 text-white focus:ring-1 focus:outline-none ${
                  errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="First name"
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label htmlFor="signup-lastName" className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                id="signup-lastName"
                type="text"
                name="lastName"
                value={signupData.lastName}
                onChange={handleSignupChange}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 text-white focus:ring-1 focus:outline-none ${
                  errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <input
                id="signup-email"
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 text-white focus:ring-1 focus:outline-none ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="Enter your email"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 text-white focus:ring-1 focus:outline-none ${
                    errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  placeholder="+91 XXXXX XXXXX"
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="signup-company" className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
              <div className="relative">
                <input
                  id="signup-company"
                  type="text"
                  name="company"
                  value={signupData.company}
                  onChange={handleSignupChange}
                  className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 text-white focus:ring-1 focus:outline-none ${
                    errors.company ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  placeholder="Company name"
                />
                <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 pr-12 text-white focus:ring-1 focus:outline-none ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  placeholder="Create password"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">8+ chars, uppercase, lowercase, number</p>
            </div>
            
            <div>
              <label htmlFor="signup-confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  id="signup-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 pr-12 text-white focus:ring-1 focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                  placeholder="Confirm password"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label htmlFor="signup-acceptTerms" className="flex items-start cursor-pointer">
              <input
                id="signup-acceptTerms"
                type="checkbox"
                name="acceptTerms"
                checked={signupData.acceptTerms}
                onChange={handleSignupChange}
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
              />
              <div className="ml-3">
                <span className="text-white text-sm">
                  I agree to the{' '}
                  <button type="button" className="text-emerald-400 hover:text-emerald-300">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-emerald-400 hover:text-emerald-300">
                    Privacy Policy
                  </button>
                </span>
              </div>
            </label>
            {errors.acceptTerms && <p className="text-red-400 text-xs mt-1">{errors.acceptTerms}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-400">Already have an account? </span>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('login');
                resetForms();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Forgot Password Page Component
const ForgotPasswordPage = ({ 
  forgotEmail, 
  setForgotEmail, 
  errors, 
  isLoading, 
  handleForgotPassword, 
  setCurrentPage, 
  resetForms 
}: {
  forgotEmail: string;
  setForgotEmail: (email: string) => void;
  errors: FormErrors;
  isLoading: boolean;
  handleForgotPassword: (e: React.FormEvent) => void;
  setCurrentPage: (page: 'login' | 'signup' | 'forgot' | 'success') => void;
  resetForms: () => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-400">Enter your email to receive a reset link</p>
        </div>
        
        <form className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm space-y-6" onSubmit={handleForgotPassword}>
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{errors.general}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={`w-full bg-gray-700/50 border rounded-lg px-4 py-3 pl-12 text-white focus:ring-1 focus:outline-none ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
                placeholder="Enter your email"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('login');
                resetForms();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Success Page Component
const SuccessPage = ({ 
  successMessage, 
  successType, 
  setCurrentPage, 
  resetForms, 
  setSuccessMessage 
}: {
  successMessage: string;
  successType: SuccessType;
  setCurrentPage: (page: 'login' | 'signup' | 'forgot' | 'success') => void;
  resetForms: () => void;
  setSuccessMessage: (message: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {successType === 'login' && 'Welcome Back!'}
            {successType === 'signup' && 'Account Created!'}
            {successType === 'forgot' && 'Email Sent!'}
          </h2>
          
          <p className="text-gray-400 mb-8">{successMessage}</p>
          
          {successType === 'signup' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <p className="text-emerald-400 text-sm">
                Please check your email for a verification link to activate your account.
              </p>
            </div>
          )}
          
          {successType === 'forgot' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                Check your email for password reset instructions. The link will expire in 1 hour.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {successType === 'login' && (
              <button 
              onClick={() => {
                // Navigate to the dashboard route instead of calling setCurrentPage with an invalid value
                window.location.href = '/uploaddocs';
                resetForms();
                setSuccessMessage('');
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Upload Documents
              </button>
            )}
            
            {(successType === 'signup' || successType === 'forgot') && (
              <button
                onClick={() => {
                  setCurrentPage('login');
                  resetForms();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Back to Sign In
              </button>
            )}
            
            <button
              onClick={() => {
                setCurrentPage('login');
                resetForms();
                setSuccessMessage('');
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'forgot' | 'success'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState<SuccessType>('login');

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  // Handle input changes for login
  const handleLoginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle input changes for signup
  const handleSignupChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSignupData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: FormErrors = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(loginData.email)) newErrors.email = 'Invalid email format';
    if (!loginData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure
      if (Math.random() > 0.3) {
        setSuccessMessage(`Welcome back, ${loginData.email.split('@')[0]}!`);
        setSuccessType('login');
        setCurrentPage('success');
      } else {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    }
    
    setIsLoading(false);
  };

  // Signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: FormErrors = {};
    if (!signupData.firstName) newErrors.firstName = 'First name is required';
    if (!signupData.lastName) newErrors.lastName = 'Last name is required';
    if (!signupData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(signupData.email)) newErrors.email = 'Invalid email format';
    if (!signupData.phone) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(signupData.phone)) newErrors.phone = 'Invalid Indian phone number';
    if (!signupData.company) newErrors.company = 'Company name is required';
    if (!signupData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(signupData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (!signupData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!signupData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure
      if (Math.random() > 0.2) {
        setSuccessMessage(`Account created successfully! Welcome, ${signupData.firstName}!`);
        setSuccessType('signup');
        setCurrentPage('success');
      } else {
        setErrors({ general: 'Email already exists. Please use a different email.' });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
    
    setIsLoading(false);
  };

  // Forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!forgotEmail) {
      setErrors({ email: 'Email is required' });
      setIsLoading(false);
      return;
    }
    
    if (!validateEmail(forgotEmail)) {
      setErrors({ email: 'Invalid email format' });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage(`Password reset link sent to ${forgotEmail}`);
      setSuccessType('forgot');
      setCurrentPage('success');
    } catch (error) {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    }
    
    setIsLoading(false);
  };

  // Reset all forms
  const resetForms = useCallback(() => {
    setLoginData({ email: '', password: '' });
    setSignupData({
      firstName: '', lastName: '', email: '', phone: '', 
      company: '', password: '', confirmPassword: '', acceptTerms: false
    });
    setForgotEmail('');
    setErrors({});
  }, []);

  // Main render logic
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage
            loginData={loginData}
            errors={errors}
            showPassword={showPassword}
            isLoading={isLoading}
            handleLoginChange={handleLoginChange}
            handleLogin={handleLogin}
            setShowPassword={setShowPassword}
            setCurrentPage={setCurrentPage}
            resetForms={resetForms}
          />
        );
      case 'signup':
        return (
          <SignupPage
            signupData={signupData}
            errors={errors}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isLoading={isLoading}
            handleSignupChange={handleSignupChange}
            handleSignup={handleSignup}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            setCurrentPage={setCurrentPage}
            resetForms={resetForms}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordPage
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            errors={errors}
            isLoading={isLoading}
            handleForgotPassword={handleForgotPassword}
            setCurrentPage={setCurrentPage}
            resetForms={resetForms}
          />
        );
      case 'success':
        return (
          <SuccessPage
            successMessage={successMessage}
            successType={successType}
            setCurrentPage={setCurrentPage}
            resetForms={resetForms}
            setSuccessMessage={setSuccessMessage}
          />
        );
      default:
        return (
          <LoginPage
            loginData={loginData}
            errors={errors}
            showPassword={showPassword}
            isLoading={isLoading}
            handleLoginChange={handleLoginChange}
            handleLogin={handleLogin}
            setShowPassword={setShowPassword}
            setCurrentPage={setCurrentPage}
            resetForms={resetForms}
          />
        );
    }
  };

  return renderCurrentPage();
};

export default Page;