import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, ArrowRight, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import aimployLogo from "@/assets/aimploy-logo.png";
import authLoginHero from "@/assets/auth-login-hero.jpg";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, login, loginWithOTP, requestOTP, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect") || searchParams.get("redirectTo");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(() => emailParam || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectParam || "/dashboard";

  const performRedirect = (target: string) => {
    if (target.startsWith("http://") || target.startsWith("https://") || target.includes("//")) {
      window.location.href = target;
    } else {
      navigate(target, { replace: true });
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      performRedirect(from);
    }
  }, [isAuthenticated, authLoading, from]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: error instanceof Error ? error.message : "Unable to connect with Google",
        variant: "destructive",
      });
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: "Success", description: "Welcome back!" });
      performRedirect(from);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestOTP(email);
      setShowOTPInput(true);
      setOtpExpiry(response.expires_in);
      toast({ title: "OTP Sent", description: "Check your email for the verification code" });
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!email || !otp || otp.length !== 6) {
      toast({ title: "Error", description: "Please enter the 6-digit OTP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOTP(email, otp);
      toast({ title: "Success", description: "Welcome back!" });
      performRedirect(from);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const features = [
    "Access your job applications",
    "Track interview progress",
    "Connect with employers",
    "Manage your profile",
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Fixed Image Section */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 bottom-0 overflow-hidden">
        <div className="relative w-full h-full">
          <img 
            src={authLoginHero} 
            alt="Career opportunities" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-start p-12 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6">
                <Sparkles size={16} />
                Welcome Back
              </div>
              
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Discover Your Next Opportunity
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-md">
                Sign in to access your personalized job dashboard and continue your career journey.
              </p>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 text-white/90"
                  >
                    <CheckCircle size={18} className="text-green-400" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Scrollable Form */}
      <div className="flex-1 lg:ml-[50%] min-h-screen overflow-y-auto">
        <div className="flex items-center justify-center p-6 lg:p-12 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="flex justify-center mb-6">
              <Link to="/" className="inline-block">
                <img src="/aimploy-logo.png" alt="Aimploy" className="h-10 object-contain" />
              </Link>
            </div>

            <div className="border border-gray-200/30 rounded-lg p-6 bg-white/10 backdrop-blur-sm shadow-sm">
              <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-muted-foreground mb-8">
                Enter your credentials to access your account
              </p>

              {/* Login Method Toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={loginMethod === "password" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLoginMethod("password");
                    setShowOTPInput(false);
                  }}
                >
                  Password
                </Button>
                <Button
                  variant={loginMethod === "otp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLoginMethod("otp")}
                >
                  OTP Login
                </Button>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && loginMethod === "otp" && !showOTPInput && email) {
                          e.preventDefault();
                          handleRequestOTP();
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {loginMethod === "password" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 h-12"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {!showOTPInput ? (
                      <Button
                        variant="hero"
                        size="xl"
                        className="w-full"
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight size={18} />
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Enter OTP</Label>
                          <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to {email}
                            {otpExpiry && (
                              <span className="block mt-1">Expires in {Math.floor(otpExpiry / 60)} minutes</span>
                            )}
                          </p>
                          <InputOTP 
                            maxLength={6} 
                            value={otp} 
                            onChange={setOtp}
                            onComplete={handleOTPLogin}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && otp.length === 6) {
                                handleOTPLogin();
                              }
                            }}
                          >
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} className="h-12 w-12" />
                              <InputOTPSlot index={1} className="h-12 w-12" />
                              <InputOTPSlot index={2} className="h-12 w-12" />
                              <InputOTPSlot index={3} className="h-12 w-12" />
                              <InputOTPSlot index={4} className="h-12 w-12" />
                              <InputOTPSlot index={5} className="h-12 w-12" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            type="button"
                            onClick={handleRequestOTP}
                            disabled={isLoading}
                          >
                            Resend OTP
                          </Button>
                          <Button
                            variant="hero"
                            className="flex-1"
                            type="button"
                            onClick={handleOTPLogin}
                            disabled={isLoading || otp.length !== 6}
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Login"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                variant="outline"
                size="xl"
                className="w-full h-12"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            </div>


            <p className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{" "}
              <Link 
                to={`/register${location.search}`} 
                state={location.state} 
                className="text-primary font-medium hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
