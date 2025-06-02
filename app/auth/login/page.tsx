import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">BettingTipsPro</h2>
          <p className="mt-2 text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
