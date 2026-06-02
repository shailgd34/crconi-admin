import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Crconi digital  SignIn Dashboard | Crconi Digital Admin - Next.js Admin Dashboard Template"
        description="This is Crconi digital  SignIn Tables Dashboard page for Crconi Digital Admin - Crconi digital  Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
