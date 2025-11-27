/**
 * SIGNUP PAGE
 *
 * Why this file exists:
 * - Provides a basic registration form (UI only) for new users (student/teacher).
 *
 * What it does:
 * - Renders a form with first/last name, email, and password fields
 * - Uses shared UI components for consistency
 * - In demo mode, it does not submit to a backend
 */
import GradientBackground from "../../components/GradientBackground";
import Header from "../../components/Header";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function SignupPage() {
  return (
    <GradientBackground>
      <Header />
      <div className="mt-16 flex justify-center px-4">
        <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
          <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-600">
            <span className="text-sm">📝</span>
          </div>
          <h2 className="text-center text-sm font-semibold text-gray-800">Create an account</h2>
          <p className="mt-1 text-center text-xs text-gray-500">Join as a Student or Teacher</p>
          <form className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="First name" placeholder="Enter first name" />
            <Input label="Last name" placeholder="Enter last name" />
            <Input label="Email" type="email" placeholder="Enter your email" className="md:col-span-2" />
            <Input label="Password" type="password" placeholder="Enter your password" />
            <Input label="Confirm password" type="password" placeholder="Re-enter password" />
            <div className="md:col-span-2">
              <Button type="submit" fullWidth>Create account</Button>
            </div>
          </form>
        </div>
      </div>
    </GradientBackground>
  );
}



