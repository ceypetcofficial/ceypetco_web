import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Fuel, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred. Please try again.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#062e3b] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 36px)",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <Fuel className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-wider" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                CEYPETCO
              </h1>
              <p className="text-[#8faab0] text-[10px] tracking-[0.15em] uppercase font-bold">
                Ceylon Petroleum Corporation
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white font-extrabold text-4xl leading-tight mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            Official Website
            <br />
            Administration
          </h2>
          <p className="text-[#8faab0] text-sm leading-relaxed max-w-md">
            Manage the CEYPETCO public website content, fuel prices, tenders,
            news and operational data through a unified administration
            dashboard.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-white/30 rounded-full"
                />
              ))}
            </div>
          </div>
          <p className="text-[#66767d] text-[11px] mt-6">
            &copy; {new Date().getFullYear()} Ceylon Petroleum Corporation. All
            rights reserved.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
              <Fuel className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-[#092f3b]" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                CEYPETCO
              </h1>
              <p className="text-[10px] tracking-[0.12em] uppercase font-bold text-[#6c7a7e]">
                Administration
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-red-600 mb-3">
              ADMIN LOGIN
            </p>
            <h2 className="text-[#092f3b] font-extrabold text-[28px] leading-tight mb-2" style={{ fontFamily: "'League Spartan', sans-serif", color: '#092f3b' }}>
              Welcome Back
            </h2>
            <p className="text-[#66767d] text-sm">
              Sign in to manage the CEYPETCO website.
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#092f3b] mb-2 font-['Manrope']"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                  if (apiError) setApiError("");
                }}
                placeholder="admin@ceypetco.gov.lk"
                className={`w-full h-12 px-4 border rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.email ? "border-red-400 bg-red-50/50" : "border-slate-200 bg-slate-50/50"
                }`}
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#092f3b] mb-2 font-['Manrope']"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                    if (apiError) setApiError("");
                  }}
                  placeholder="Enter your password"
                  className={`w-full h-12 px-4 pr-12 border rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                    errors.password
                      ? "border-red-400 bg-red-50/50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/20 accent-red-600 cursor-pointer"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-[#66767d] select-none group-hover:text-[#092f3b] transition-colors">
                  Remember Me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-red-600/25 hover:shadow-md hover:shadow-red-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-[#879699]">
            Protected administration area. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
