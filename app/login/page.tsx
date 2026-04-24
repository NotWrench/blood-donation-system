"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, Mail, Lock, ArrowRight, Globe, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Sparkles 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({ email: "", password: "" }); // Reset errors
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Invalid credentials", type: "error" });
        return;
      }
      
      // Store real login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToast({ message: "Login successful! Redirecting...", type: "success" });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err) {
      setToast({ message: "Unable to connect to the authentication server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 font-sans selection:bg-rose-500/30">
      
      {/* Background Glow Decorations */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="mb-6 group">
            <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-600/40 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
              <Heart className="w-9 h-9 fill-white stroke-none" />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Welcome back</h1>
          <p className="text-neutral-500 mt-2 font-medium">Please enter your details to sign in</p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 shadow-2xl shadow-black/50 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full bg-neutral-950 border rounded-2xl pl-14 pr-5 py-4 text-white outline-none transition-all font-bold placeholder:text-neutral-700 hover:border-neutral-700 ${
                    errors.email ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "border-neutral-800 focus:border-rose-500"
                  }`}
                  noValidate
                />
              </div>
              {errors.email && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Password</label>
                <Link href="#" className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:text-rose-400 transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-neutral-950 border rounded-2xl pl-14 pr-14 py-4 text-white outline-none transition-all font-bold placeholder:text-neutral-700 hover:border-neutral-700 ${
                    errors.password ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "border-neutral-800 focus:border-rose-500"
                  }`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">{errors.password}</p>}
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-6">
            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-neutral-600 uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
               <button type="button" className="flex items-center justify-center gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl py-3.5 hover:bg-neutral-800 transition-all text-sm font-bold text-neutral-300">
                  <Globe className="w-4 h-4" /> Google
               </button>
               <button type="button" className="flex items-center justify-center gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl py-3.5 hover:bg-neutral-800 transition-all text-sm font-bold text-neutral-300">
                  <Sparkles className="w-4 h-4" /> Github
               </button>
            </div>
          </div>
        </div>


        {/* Footer */}
        <p className="text-center mt-8 text-neutral-500 font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="text-rose-500 font-black hover:text-rose-400 transition-colors">Join the community</Link>
        </p>

      </div>

      {/* Toast Notification */}
      {toast.type && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 z-[100] border ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-black tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
