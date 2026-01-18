import { LoginForm } from "@/components/login-form";
import type { User } from "@/types/types";

type LoginProps = {
  onLoginSuccess: (user: User, authHeader: string) => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}