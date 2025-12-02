import { useState } from "react";
import AuthForm from "../components/auth/AuthForm.tsx";
import { BookOpen } from "lucide-react";

interface AuthProps {
  onAuthSuccess?: () => void;
}

const Auth = ({ onAuthSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-card/80 backdrop-blur-md rounded-2xl shadow-soft-lg overflow-hidden border border-border/50">
        {/* Left panel: Branding */}
        <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-accent/20 rounded-full" />
          <div className="absolute bottom-20 right-10 w-32 h-32 border-2 border-primary/20 rounded-full" />
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary shadow-soft">
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              The Book Place
            </h1>
            <p className="text-muted-foreground max-w-xs">
              Your personal library awaits. Discover, collect, and cherish your favorite reads.
            </p>
          </div>

          {/* Book stack illustration */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-8 h-12 bg-accent/30 rounded-sm transform -rotate-6" />
            <div className="w-8 h-14 bg-primary/30 rounded-sm" />
            <div className="w-8 h-10 bg-accent/20 rounded-sm transform rotate-6" />
          </div>
        </div>

        {/* Right panel: Form */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-soft">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                The Book Place
              </h1>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                isLogin
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
              {isLogin && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent rounded-full" />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                !isLogin
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
              {!isLogin && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          </div>

          {/* Form container */}
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {isLogin ? "Welcome back" : "Join us"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin
                  ? "Sign in to access your reading list"
                  : "Create an account to start your collection"}
              </p>
            </div>

            <AuthForm
              isLogin={isLogin}
              onAuthSuccess={onAuthSuccess}
              onRegisterSuccess={() => setIsLogin(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;