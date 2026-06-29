'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        router.push('/chat');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 bg-white/5 backdrop-blur-xl border border-white/10 z-10">
        
        {/* Left Side - Welcome / Branding */}
        <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-indigo-600/40 to-purple-800/40 hidden md:flex relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="z-10">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Chat <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">With Me</span></h1>
            <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
              Connect with your friends, share moments, and stay in touch seamlessly with our premium real-time chatting platform.
            </p>
            <div className="flex items-center space-x-4">
              <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <span className="text-sm font-medium tracking-wider uppercase text-purple-300">Join the conversation</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <div className="flex space-x-2 bg-white/10 p-1 rounded-lg backdrop-blur-md">
              <button 
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isLogin ? 'bg-indigo-500 shadow-lg' : 'hover:bg-white/5 text-gray-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${!isLogin ? 'bg-purple-500 shadow-lg' : 'hover:bg-white/5 text-gray-300'}`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:bg-white/10 focus:border-purple-500 transition-all duration-300 text-white placeholder-gray-500"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:bg-white/10 focus:border-purple-500 transition-all duration-300 text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transform transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                {isLogin ? 'Register now' : 'Log in instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
