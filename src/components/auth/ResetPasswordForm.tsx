import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useResetPasswordMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface ResetPasswordInputs {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync token from URL to localStorage so it is sent in the Authorization header
  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watch("password");

  const onSubmit = async (data: ResetPasswordInputs) => {
    setApiError(null);
    if (!token) {
      const errMsg = "Authentication token is missing. Please go back to the Forgot Password screen.";
      setApiError(errMsg);
      toast.error(errMsg);
      return;
    }
    try {
      await resetPassword({
        token,
        password: data.password,
        confirm_password: data.confirmPassword,
      }).unwrap();

      toast.success("Password reset successful! Please sign in.");
      // Clear temporary auth token so it doesn't leak or interfere with sign-in
      localStorage.removeItem("auth_token");
      // On success, redirect to signin with a success query param
      navigate("/signin?reset=success");
    } catch (err: any) {
      console.error("Reset password failed:", err);
      const errMsg = err.data?.message || err.data?.error || err.message || "Failed to reset password. The link might be expired or invalid.";
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
              Create New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please enter and confirm your new secure password below to complete the account recovery process.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                
                {/* New Password */}
                <div>
                  <Label>
                    New Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("password", {
                        required: "New password is required",
                        minLength: {
                          value: 4,
                          message: "Password must be at least 4 characters",
                        },
                      })}
                      className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                        errors.password
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

                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm New Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (value) =>
                          value === watchPassword || "Passwords do not match",
                      })}
                      className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                        errors.confirmPassword
                          ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                          : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                      }`}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* API Error Alert */}
                {apiError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    <div className="font-semibold mb-0.5">Reset Failed</div>
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
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>

                {/* Back to Sign In */}
                <div className="text-center">
                  <Link
                    to="/signin"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
