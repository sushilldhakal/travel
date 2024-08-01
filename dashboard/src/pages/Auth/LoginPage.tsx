import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register, verifyEmail, forgotPassword, resetPassword } from "@/http/api";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useTokenStore from '@/store';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, ContactRound, FolderPen, LockKeyhole, Mail, Repeat1, Smartphone } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Switch } from "@/components/ui/switch";
import './login.css';
import { toast } from "@/components/ui/use-toast";


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useTokenStore((state) => state.setToken);



  const loginEmailRef = useRef<HTMLInputElement>(null);
  const registerEmailRef = useRef<HTMLInputElement>(null);
  const forgotPasswordEmailRef = useRef<HTMLInputElement>(null);
  const registerPasswordRef = useRef<HTMLInputElement>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [showForm, setShowForm] = useState('login');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const switchForm = (formType) => setShowForm(formType);
  const [forgotToken, setForgotToken] = useState('');
  useEffect(() => {
    // Add the class if the path matches
    if (location.pathname === '/auth/login' || location.pathname === '/auth/login/verify' || location.pathname === '/auth/login/forgot') {
      document.body.classList.add('login-page');
    } else {
      // Remove the class if the path does not match
      document.body.classList.remove('login-page');
    }
    const query = new URLSearchParams(location.search);
    const token = query.get('token') || '';
    const forgotToken = query.get('forgottoken') || '';
    setForgotToken(forgotToken)
    if (token) {
      verifyMutation.mutate({ token });
    }
    if (forgotToken) {
      document.body.classList.add('forgot');
      setShowForm('forgot-section login');
    }
    // Cleanup on component unmount or path change
    return () => {
      document.body.classList.remove('login-page');
      document.body.classList.remove('forgot');
    };
  }, [location.pathname]);


  const resetPasswordMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) => resetPassword(data),
    onSuccess: () => {
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now log in.',
      });
      setShowForm('login active ');
    },

    onError: (error) => toast({
      title: 'Error',
      description: `${error.message}`,
    }),
  });

  const handleConfirmPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = forgotToken;
    const password = confirmPasswordRef.current?.value.trim() || '';
    resetPasswordMutation.mutate({ token, password });
  };

  const registrationMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      verifyForm();
    }, onError: (error) => toast({
      title: 'Incorrect Email or Password',
      description: `Please Enter new email and password`,
    })
  });


  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      const accessToken = localStorage.getItem("token-store");
      if (!accessToken) return false;
      const decoded = jwtDecode(accessToken) as { roles?: string };
      if (decoded.roles === 'admin' || decoded.roles === 'seller') {
        navigate('/dashboard/home');
      } else {
        navigate('/');
      }
    }, onError: (error) => toast({
      title: 'Incorrect Email or Password',
      description: `Please Enter your email and password`,
    }),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast({
        title: 'Email has been verify',
        description: 'Email verification completed. Please login to continue',
      });
      setShowForm('signup active verified ');
    },

    onError: (error) => toast({
      title: 'Error occurred',
      description: `${error}`,
    }),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast({
        title: 'Email sent to you email address',
        description: 'Please check your email to get new password',
      });
      setShowForm('forgot-section login');
    },
    onError: (error) => toast({
      title: 'Error occurred',
      description: `${error}`,
    }),
  });

  const validateLogin = () => {
    const email = loginEmailRef.current?.value.trim() || '';
    const password = passwordRef.current?.value.trim() || '';
    console.log("email", email, "password", password);
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const email = registerEmailRef.current?.value.trim() || '';
    const password = registerPasswordRef.current?.value.trim() || '';
    const name = nameRef.current?.value.trim() || '';
    const phone = phoneRef.current?.value.trim() || '';
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!name) newErrors.name = 'Name is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPassword = () => {
    const email = forgotPasswordEmailRef.current?.value.trim() || '';
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleLoginSubmit = () => {
    if (validateLogin()) {
      const email = loginEmailRef.current?.value ?? '';
      const password = passwordRef.current?.value ?? '';
      const keepMeSignedIn = checked;
      loginMutation.mutate({ email, password, keepMeSignedIn });
    }
  };

  const handleRegisterSubmit = () => {

    if (validateRegister()) {
      const email = registerEmailRef.current?.value ?? '';
      const password = registerPasswordRef.current?.value ?? '';
      const name = nameRef.current?.value ?? '';
      const phone = phoneRef.current?.value ?? '';
      console.log("inside handle registration");

      registrationMutation.mutate({ name, email, password, phone });
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (validateForgotPassword()) {
      const email = forgotPasswordEmailRef.current?.value ?? '';
      forgotPasswordMutation.mutate({ email });
    }
    setShowForm('forgot-section login');
  };

  const verifyForm = () => {
    setShowForm('signup active');

  }

  const handleForgotPassword = () => {
    setShowForm('forgot-section login');
  }

  const handleTicket = (e) => {
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.classList.add('selected');
    }
  }


  const handleChecked = (e) => {
    setChecked(!checked);
  }



  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className={`container ${showForm}`}>
        <div className="overlay"></div>
        <div className="box"></div>
        <div className="container-forms">
          <div className="container-info">
            <div className="info-item">
              <div className="table">
                <div className="table-cell">
                  <p>Have an account?</p>
                  <Button className="btn" onClick={() => switchForm('login')}>
                    Log in
                  </Button>
                </div>
              </div>
            </div>
            <div className="info-item">
              <div className="table">
                <div className="table-cell">
                  <p>Don't have an account?</p>
                  <Button className="btn sign-up-form" type="button" onClick={() => switchForm('signup')}>
                    Sign up
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="container-form">
            <div className={`form-item log-in ${showForm === 'login' || showForm === 'login forgot' ? 'active' : ''}`}>
              <div className="table">
                <div className="table-cell">
                  {
                    loginMutation.error && <p className="text-red-500 pl-5 text-xs text-center">Email and Password doesn't match</p>
                  }
                  <h4 className="login_fields__user header-login mb-3 mt-4">
                    <ContactRound />
                    Your Email and Password

                  </h4>

                  <div className="login_fields__user input-field">
                    <div className="icon">
                      <Mail />
                    </div>

                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" placeholder="Email" type="email" ref={loginEmailRef} onKeyUp={handleTicket} />
                    <div className="validation">
                      <Check />
                    </div>
                    {errors.email && <p className="text-red-500 pl-5 text-xs">{errors.email}</p>}

                  </div>
                  <div className="login_fields__user input-field">
                    <div className="icon">
                      <LockKeyhole />
                    </div>
                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" placeholder="Password" type="password" ref={passwordRef} />
                    {errors.password && <p className="text-red-500 pl-5 text-xs">{errors.password}</p>}
                    <div className="forgot login_fields__user">
                      <Button className="btn link forgot" onClick={handleForgotPassword}>Forgot?</Button>
                    </div>
                  </div>
                  <div className="field login_fields__user">
                    <div className="flex items-center space-x-2">
                      <Switch id="longSignin" checked={checked} onCheckedChange={handleChecked} />
                      <Label htmlFor="longSignin">Keep me signed in</Label>
                    </div>
                  </div>
                  <Button className="btn login-btn login_fields__user" onClick={handleLoginSubmit}>
                    Log in
                  </Button>
                  <div className="visible-xs">
                    <p>Don't have an account?</p>
                    <div className="btn mobile-signup sign-up-form" onClick={() => switchForm('signup')}>
                      Sign up
                    </div>
                  </div>
                  <div className="hidden forgot-form">
                    {forgotPasswordMutation.isSuccess && <p className="text-green-500 pl-5 text-xs text-center">Email sent successfully</p>}
                    <h4 className="forgot_fields__user header-login">
                      <ContactRound />
                      Enter your {forgotToken ? 'new password' : 'Email'}
                    </h4>
                    <div className="forgot_fields__user input-field">
                      <div className="icon">
                        {
                          forgotToken ? <LockKeyhole /> : <Mail />
                        }
                      </div>
                      <Input className="w-full pl-5 pr-5 no-autofill-bkg" placeholder={`${forgotToken ? 'New Password' : 'Email'}`} ref={forgotToken ? confirmPasswordRef : forgotPasswordEmailRef} type={forgotToken ? 'password' : 'email'} onKeyUp={handleTicket} />
                      <div className="validation">
                        <Check />
                      </div>
                    </div>
                    <Button className="btn forgot-btn forgot_fields__user" onClick={forgotToken ? handleConfirmPasswordSubmit : handleForgotPasswordSubmit}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className={`form-item sign-up ${showForm === 'signup' ? 'active' : ''}`}>
              <div className="table">
                <div className="table-cell">
                  <h4 className="header-signup signup_fields__user">
                    <ContactRound />
                    New User Registration
                  </h4>
                  <div className="signup_fields__user input-field">
                    <div className="icon">
                      <Mail />
                    </div>
                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" placeholder="Email" type="email" ref={registerEmailRef} onKeyUp={handleTicket} />
                    <div className="validation">
                      <Check />
                    </div>
                    {errors.email && <p className="text-red-500 pl-5 text-xs">{errors.email}</p>}

                  </div>
                  <div className="signup_fields__user input-field">
                    <div className="icon">
                      <FolderPen />
                    </div>
                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" name="full name" placeholder="Full Name" type="text" ref={nameRef} onKeyUp={handleTicket} />
                    <div className="validation">
                      <Check />
                    </div>
                    {errors.name && <p className="text-red-500 pl-5 text-xs">{errors.name}</p>}

                  </div>
                  <div className="signup_fields__user input-field">
                    <div className="icon">
                      <Smartphone />
                    </div>
                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" name="mobile" placeholder="Phone Number" type="number" ref={phoneRef} onKeyUp={handleTicket} />
                    <div className="validation">
                      <Check />
                    </div>
                  </div>
                  <div className="signup_fields__user input-field">
                    <div className="icon">
                      <LockKeyhole />
                    </div>
                    <Input className="w-full pl-5 pr-5 no-autofill-bkg" name="Password" placeholder="Password" type="password" ref={registerPasswordRef} onKeyUp={handleTicket} />
                    <div className="validation">
                      <Check />
                    </div>
                    {errors.password && <p className="text-red-500 pl-5 text-xs">{errors.password}</p>}

                  </div>
                  <div className="field signup_fields__user">
                    <div className="flex items-center space-x-2">
                      <Switch id="userAgreement" />
                      <Label htmlFor="userAgreement">I accept the <a href="#">User Agreement</a></Label>
                    </div>
                  </div>
                  <Button className="btn signup-btn signup_fields__user" onClick={handleRegisterSubmit}>
                    Sign up
                  </Button>
                  <div className="visible-xs">
                    <p>Already a member?</p>
                    <div className="btn mobile-signup sign-up-form" onClick={() => switchForm('login')}>
                      Login
                    </div>
                  </div>
                  <h4 className="verify_fields__user header-login hide-on-verified">
                    Please verify your account by clicking in the link sent to your email that you have provided
                  </h4>

                  <h4 className="verify_fields__user header-login show-on-verified text-green-600">
                    You email has been verified. Please login to Continue
                  </h4>



                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;



{/* <Card className="mx-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  ref={emailRef}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input ref={passwordRef} id="password" type="password" required />
              </div>
              <Button
                onClick={handleLoginSubmit}
                className="w-full"
                disabled={mutation.isPending}>
                {mutation.isPending && <LoaderCircle className="animate-spin" />}

                <span className="ml-2">Sign in</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Switch id="longLogin" />
                <Label htmlFor="longLogin">Keep me logged in</Label>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to={routePaths.auth.register} className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card> */}