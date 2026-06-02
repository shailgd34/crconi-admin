import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyOtpForm from "../../components/auth/VerifyOtpForm";

export default function VerifyOtp() {
  return (
    <>
      <PageMeta
        title="Verify OTP | Crconi Digital Admin"
        description="Verify your one-time password (OTP) code."
      />
      <AuthLayout>
        <VerifyOtpForm />
      </AuthLayout>
    </>
  );
}
