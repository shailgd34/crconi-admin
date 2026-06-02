import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useAppDispatch } from "../../store";
import { useLoginMutation } from "../../store/api/apiSlice";
import { setCredentials } from "../../store/slices/authSlice";
import { toast } from "react-hot-toast";


interface SignInInputs {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const resetSuccess = searchParams.get("reset") === "success";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInputs>({
    defaultValues: {
      email: "",
      password: "",
      keepLoggedIn: false,
    },
  });

  const onSubmit = async (data: SignInInputs) => {
    setApiError(null);
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      // Dispatch to Redux store
      dispatch(
        setCredentials({
          token: response.token,
          email: data.email,
        })
      );
      toast.success("Sign-in successful! Welcome to the dashboard.");
      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      const errMsg = err.data?.message || err.data?.error || err.message || "Authentication failed. Please check your credentials.";
      setApiError(errMsg);
      toast.error(errMsg);
    }
  };


  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Admin Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to securely access your Croconi Digital Admin control panel.
            </p>
            {resetSuccess && (
              <div className="mt-4 p-3 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                <span className="font-semibold text-green-800 dark:text-green-300">Success!</span> Password has been reset. Please sign in with your new password.
              </div>
            )}
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">

                {/* Email Input */}
                <div>
                  <Label>
                    Email Address <span className="text-error-500">*</span>
                  </Label>
                  <input
                    type="email"
                    placeholder="info@gmail.com"
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address format",
                      },
                    })}
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errors.email
                      ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                      : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                      }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 4,
                          message: "Password must be at least 4 characters",
                        },
                      })}
                      className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errors.password
                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                        : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                        }`}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.password.message}</p>
                  )}
                </div>

                {/* Keep Logged In */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      id="keepLoggedIn"
                      type="checkbox"
                      {...register("keepLoggedIn")}
                      className="h-4.5 w-4.5 rounded-lg border-gray-300 text-brand-500 focus:ring-brand-500/25 dark:border-gray-800 cursor-pointer"
                    />
                    <label
                      htmlFor="keepLoggedIn"
                      className="block font-normal text-gray-750 text-theme-sm dark:text-gray-400 cursor-pointer select-none"
                    >
                      Keep me logged in
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* API Error Alert */}
                {apiError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    <div className="font-semibold mb-0.5">Login Failed</div>
                    {apiError}
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <Button type="submit" className="w-full cursor-pointer flex items-center justify-center gap-2" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
