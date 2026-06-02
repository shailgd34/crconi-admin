import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useForgotPasswordMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface ForgotPasswordInputs {
  email: string;
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setApiError(null);
    try {
      await forgotPassword({ email: data.email }).unwrap();
      toast.success(`An OTP verification code has been sent to ${data.email}!`);
      // On success, redirect to verify-otp
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      console.error("Forgot password API failed:", err);
      const errMsg = err.data?.message || err.data?.error || err.message || "Failed to initiate password reset. Please try again.";
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
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the email address associated with your account and we will send you a one-time OTP code to reset your password.
            </p>
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
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      errors.email
                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                        : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.email.message}</p>
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
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP Code"
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

