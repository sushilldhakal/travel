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
import { login } from "@/http/api"
import { useMutation } from "@tanstack/react-query"
import { useRef } from "react"
import {Link, useNavigate} from "react-router-dom"
import useTokenStore from '@/store';
const LoginPage = () => {

  const navigate = useNavigate();
  const setToken = useTokenStore((state) => state.setToken);

  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);


  // Mutations
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
            navigate('/dashboard/home');
    },
  })

  const handleLoginSubmit = () =>{
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    console.log("data",{email, password})

    if(!email || !password){
      //change to toaster
      return alert("Login failed")
    }
    mutation.mutate({email, password})
  } 

  return (
    <div className="flex justify-center items-center h-screen">
<Card className="mx-full max-w-sm">
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
          <Button onClick={handleLoginSubmit}  className="w-full">
            Login
          </Button>
          {/* <Button variant="outline" className="w-full">
            Login with Google
          </Button> */}
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/auth/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>

  )
}

export default LoginPage