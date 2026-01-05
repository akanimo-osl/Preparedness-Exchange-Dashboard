import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/contexts/ToastProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { authService } from "@/services/auth_service";
import type { LoginData } from "@/types/auth_type";
import { validateEmail, validatePassword } from "@/utils";
import { useNews } from "@/contexts/NewsProvider";

export default function Login() {
    const navigate = useNavigate();
    const { reloadNews } = useNews();
    const { showToast } = useToast();
    const { set: setUserData } = useAuth();

  const [form, setForm] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);


  const validateForm = (): boolean => {
    const errs: Partial<LoginData> = {};
    const emailErr = validateEmail(form.email)
    if (emailErr) errs.email = emailErr
    const pwdErr = validatePassword(form.password)
    if (pwdErr) errs.password = pwdErr
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };


    // Get the 'next' parameter from query string
    const redirectTo = new URLSearchParams(window.location.search).get('next') || '/';
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
        setLoading(true);
      const response = await authService.login(form);
      setUserData(response.data.user)
        navigate(redirectTo);
        showToast(response.message, "success", 5000);
        reloadNews()
    } catch (err: any) {
      showToast(err?.message || 'Unknown error.', "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInput =
    (field: keyof LoginData) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0B1221] text-white px-4">
      <div className="w-full max-w-md">
        {/* WHO HEADER */}
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="WHO Logo"
            className="w-36 mx-auto mb-4"
          />
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-xl shadow-md"
        >
          <h3 className="text-center text-lg mb-6">
            Login in to your account
          </h3>

          {/* EMAIL */}
          <label className="block text-sm mb-1">Email address</label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[#0D1527] rounded-lg outline-none border border-gray-700 focus:border-blue-500"
            value={form.email}
            onChange={handleInput("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}

          {/* PASSWORD */}
          <label className="block text-sm mt-4 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 bg-[#0D1527] rounded-lg outline-none border border-gray-700 focus:border-blue-500"
              value={form.password}
              onChange={handleInput("password")}
            />

            {/* Lucide Icon */}
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}

          {/* FORGOT PASSWORD */}
          {/* <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-white underline"
            >
              Forgot Password?
            </button>
          </div> */}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg bg-blue-900 hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
