import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef } from "react"
import routePaths from "@/lib/routePath"
import useTokenStore from "@/store/store"
import { useMutation } from "@tanstack/react-query"
import { register } from "@/http"
import { LoaderCircle } from "lucide-react"

const RegisterPage = () => {
  const setToken = useTokenStore((state) => state.setToken);

  const navigate = useNavigate();

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      navigate('/dashboard/home');
    },
  });

  const handleRegisterSubmit = () => {
    const email = emailRef.current?.value ?? '';
    const password = passwordRef.current?.value ?? '';
    const name = nameRef.current?.value ?? '';
    const phone = phoneRef.current?.value ?? '';
    mutation.mutate({ name, email, password, phone });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="mx-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input ref={nameRef} id="full-name" placeholder="Max" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                ref={emailRef}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="phone"
                placeholder="m@example.com"
                required
                ref={phoneRef}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input ref={passwordRef} id="password" type="password" />
            </div>
            <Button
              onClick={handleRegisterSubmit}
              className="w-full"
              disabled={mutation.isPending}>
              {mutation.isPending && <LoaderCircle className="animate-spin" />}

              <span className="ml-2">Create an account</span>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to={routePaths.auth.login} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>

  )
}

export default RegisterPage;