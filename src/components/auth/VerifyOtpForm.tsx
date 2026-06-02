import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface VerifyOtpInputs {
  otp: string;
}

export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInputs>({
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: VerifyOtpInputs) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      const response = await verifyOtp({
        email,
        otp: data.otp,
      }).unwrap();

      toast.success("OTP verified successfully!");
      // On success, redirect to reset-password with token
      const token = response.reset_token || response.token || "dummy-reset-token";
      
      // Store token so it can be added to Authorization headers
      localStorage.setItem("auth_token", token);
      
      navigate(`/reset-password?token=${encodeURIComponent(token)}`);
    } catch (err: any) {
      console.error("Verification failed:", err);
      const errMsg = err.data?.message || err.data?.error || err.message || "Invalid OTP code. Please check and try again.";
      setApiError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleResend = async () => {
    setApiError(null);
    setSuccessMessage(null);
    if (!email) {
      const errMsg = "Email is missing. Please go back and request a new code.";
      setApiError(errMsg);
      toast.error(errMsg);
      return;
    }
    try {
      await resendOtp({ email }).unwrap();
      const successMsg = "OTP code has been successfully resent to your email.";
      setSuccessMessage(successMsg);
      toast.success(successMsg);
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      const errMsg = err.data?.message || err.message || "Failed to resend OTP. Please try again.";
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
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We have sent a one-time OTP verification code to <span className="font-semibold text-gray-700 dark:text-white">{email || "your email"}</span>. Please enter it below.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                
                {/* OTP Input */}
                <div>
                  <Label>
                    OTP Verification Code <span className="text-error-500">*</span>
                  </Label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={10}
                    {...register("otp", {
                      required: "Verification code is required",
                      minLength: {
                        value: 4,
                        message: "Code must be at least 4 digits",
                      },
                    })}
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 text-center tracking-[0.2em] font-bold ${
                      errors.otp
                        ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                        : "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                    }`}
                  />
                  {errors.otp && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold text-left">{errors.otp.message}</p>
                  )}
                </div>

                {/* API Error Alert */}
                {apiError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-left">
                    <div className="font-semibold mb-0.5">Verification Failed</div>
                    {apiError}
                  </div>
                )}

                {/* API Success Alert */}
                {successMessage && (
                  <div className="p-3 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-950/20 dark:text-success-400 border border-success-200 dark:border-success-800/30 text-left">
                    {successMessage}
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <Button type="submit" className="w-full cursor-pointer flex items-center justify-center gap-2" size="sm" disabled={isVerifying}>
                    {isVerifying ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying Code...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>

                {/* Resend and back links */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? "Resending..." : "Resend Code"}
                  </button>
                  <Link
                    to="/forgot-password"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white font-semibold"
                  >
                    Change Email
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
