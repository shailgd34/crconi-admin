import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crconi digital  SignUp Dashboard | Crconi Digital Admin - Next.js Admin Dashboard Template"
        description="This is Crconi digital  SignUp Tables Dashboard page for Crconi Digital Admin - Crconi digital  Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
