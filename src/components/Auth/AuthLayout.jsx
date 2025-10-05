import Image from "next/image";
import Link from "next/link";
import authlogo from "../../../public/login.jpg";
import logo from "../../../public/logo.jpg";

const AuthLayout = ({ children, type = "login" }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex w-1/2 bg-primary relative ">
        <div className="absolute inset-0 bg-black/50" />
        <Image
          src={authlogo}
          alt="Auth background"
          fill
          className="object-cover"
          priority
        />
        {/* <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            {type === "login" ? "Welcome Back!" : "Join Our Community"}
          </h1>
          <p className="text-lg mb-8">
            {type === "login"
              ? "Sign in to continue your journey with us"
              : "Create an account to get started"}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Secure Authentication</h3>
              <p className="text-sm text-white/80">
                Your data is protected with industry-standard security
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center relative mb-8">
            <Link href="/" className="inline-block ">
              <h1 className="text-2xl font-bold">Edu Station</h1>
            </Link>
            <p className="text-muted-foreground mt-2">
              {type === "login"
                ? "Sign in to your account"
                : "Create a new account"}
            </p>
          </div>
          {children}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {type === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
