import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/**
 * dailyDrop — Login Page
 * Left: brand panel with a "drop" illustration + tagline (replaces a stock photo,
 * keeps the signature drop-shape motif from the theme).
 * Right: centered email/password form, forgot password, and a link to sign up.
 *
 * Uses only theme tokens from index.css (@theme block):
 * forest / leaf / mango / mist / charcoal / tomato colors,
 * font-display (Sora) / font-sans (Inter), rounded-card / rounded-pill / rounded-drop.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const {login} = useAuth();
  async function handleSubmit (e:any){
    e.preventDefault();
    const nextErrors: { email: string; password: string } = {
      email: '',
      password: ''
    };
    if (!email) nextErrors.email = "Enter your email address.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);

   try{
    await login(email,password)
   }catch(err){
 toast.error("Wrong user's credentials")
   }
  }

  return (
    <div className="min-h-screen flex bg-mist">
   
      <div className="hidden lg:flex lg:w-1/2 relative bg-forest overflow-hidden flex-col justify-between p-13">
       
        <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-drop bg-leaf-500/30" />
        <div className="pointer-events-none absolute bottom-10 right-0 w-96 h-96 rounded-drop bg-mango/10 rotate-180" />

        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-drop bg-mango flex items-center justify-center">
            <Leaf className="w-5 h-5 text-forest-900" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-h4 text-mist">dailyDrop</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display font-bold text-hero text-mist mb-4">
            Fresh, every drop.
          </h1>
          <p className="font-sans text-body text-leaf-100">
            Groceries picked this morning, at your door before you finish your coffee.
            Log in to track today's drop and reorder your usuals in a tap.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-caption text-leaf-100 font-sans">
          <span>10k+ daily orders</span>
          <span className="w-1 h-1 rounded-full bg-leaf-300" />
          <span>Delivered in 45 min</span>
        </div>
      </div>

      {/* ---------------- Right: form ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-gutter py-18">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-drop bg-mango flex items-center justify-center">
              <Leaf className="w-5 h-5 text-forest-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-h4 text-forest-700">dailyDrop</span>
          </div>

          <h2 className="font-display text-h2 text-forest-700 mb-2">Welcome back</h2>
          <p className="font-sans text-small text-charcoal-600 mb-8">
            Log in to see what's fresh today.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-sans text-small font-medium text-charcoal mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full font-sans text-body bg-white text-charcoal placeholder-charcoal-400
                    border rounded-card pl-10 pr-4 py-2.5 outline-none transition-colors
                    ${errors.email ? "border-tomato" : "border-mist-200 focus:border-leaf-500"}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 font-sans text-caption text-tomato">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block font-sans text-small font-medium text-charcoal">
                  Password
                </label>
                <a href="/forgot-password" className="font-sans text-caption text-leaf-700 hover:text-mango-700">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full font-sans text-body bg-white text-charcoal placeholder-charcoal-400
                    border rounded-card pl-10 pr-10 py-2.5 outline-none transition-colors
                    ${errors.password ? "border-tomato" : "border-mist-200 focus:border-leaf-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 font-sans text-caption text-tomato">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-mango hover:bg-mango-700 text-white font-display font-semibold
                text-body rounded-pill py-2.5 shadow-badge transition-colors duration-150"
            >
              Log in
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center font-sans text-small text-charcoal-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-leaf-700 font-medium hover:text-mango-700">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}