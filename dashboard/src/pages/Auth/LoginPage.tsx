import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register, verifyEmail, forgotPassword, resetPassword } from "@/http";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useTokenStore from '@/store/store';
import { Check, ContactRound, FolderPen, LockKeyhole, Mail, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
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
  const phoneRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [showForm, setShowForm] = useState('login');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const switchForm = (formType: string) => setShowForm(formType);
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
  }, [location.pathname, location.search]);


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

  const handleConfirmPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = forgotToken;
    const password = confirmPasswordRef.current?.value.trim() || '';
    resetPasswordMutation.mutate({ token, password });
  };

  const registrationMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      verifyForm();
      toast({
        title: 'Registration Successful',
        description: `${response} Your account has been created successfully. Please verify your email address to log in.`,
      });
    }, onError: (error) => toast({
      title: 'Registration Error',
      description: `${error}. Please try again with different information.`,
      variant: "destructive"
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
      title: 'Login Failed',
      description: `${error}. Please check your email and password.`,
      variant: "destructive"
    }),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast({
        title: 'Email Verification Complete',
        description: 'Your email has been verified. Please login to continue.',
      });
      setShowForm('signup active verified ');
    },

    onError: (error) => toast({
      title: 'Verification Error',
      description: `${error}`,
      variant: "destructive"
    }),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your email for password reset instructions.',
      });
      setShowForm('forgot-section login');
    },
    onError: (error) => toast({
      title: 'Password Reset Error',
      description: `${error}`,
      variant: "destructive"
    }),
  });

  const validateLogin = () => {
    const email = loginEmailRef.current?.value.trim() || '';
    const password = passwordRef.current?.value.trim() || '';
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
      registrationMutation.mutate({ name, email, password, phone });
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleTicket = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.target instanceof Element && e.target.nextElementSibling) {
      e.target.nextElementSibling.classList.add('selected');
    }
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (forgotToken) {
      handleConfirmPasswordSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    } else {
      handleForgotPasswordSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleChecked = () => {
    setChecked(!checked);
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/70">
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
                  {loginMutation.error && (
                    <div className="flex items-center gap-2 justify-center mb-2 text-red-500">
                      <AlertCircle size={16} />
                      <p className="text-xs">Email and Password don't match</p>
                    </div>
                  )}
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
                  <Button className="btn login-btn login_fields__user" onClick={handleLoginSubmit} disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Log in'}
                  </Button>
                  <div className="visible-xs">
                    <p>Don't have an account?</p>
                    <div className="btn mobile-signup sign-up-form" onClick={() => switchForm('signup')}>
                      Sign up
                    </div>
                  </div>
                  <div className="hidden forgot-form">
                    {forgotPasswordMutation.isSuccess && (
                      <div className="flex items-center gap-2 justify-center mb-2 text-green-500">
                        <CheckCircle2 size={16} />
                        <p className="text-xs">Email sent successfully</p>
                      </div>
                    )}
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
                    <Button className="btn forgot-btn forgot_fields__user" onClick={handleButtonClick} disabled={forgotPasswordMutation.isPending || resetPasswordMutation.isPending}>
                      {forgotPasswordMutation.isPending || resetPasswordMutation.isPending ? 'Submitting...' : 'Submit'}
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
                  <Button className="btn signup-btn signup_fields__user" onClick={handleRegisterSubmit} disabled={registrationMutation.isPending}>
                    {registrationMutation.isPending ? 'Signing up...' : 'Sign up'}
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
                    <CheckCircle2 className="mx-auto mb-2" />
                    Your email has been verified. Please login to continue
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