import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/context";

const formSchema = z.object({
  otp_code: z.string().min(6, { message: "Enter the 6-digit code" }).max(6, { message: "Code should be 6 digits" }),
  password: z.string().min(2, { message: "This is a required field" }),
  username: z.string().min(2, { message: "This is a required field" }),
});

const Login = () => {
  const {login} = useAuthContext();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp_code: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("http://localhost:8000/login", values);
      console.log(response.data);
      login(response.data.message)
      localStorage.setItem("user", JSON.stringify(response.data))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Login error:", error.response?.data || error.message);
        alert(`Login failed: ${error.response?.data.error}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[435px] min-h-[30rem] flex flex-col gap-7 rounded-3xl border-white border-[0.1rem] p-6">
        <h1 className="tracking-tight text-3xl font-semibold flex justify-center">
          Login to Continue
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tracking-tight font-semibold text-[17px]">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tracking-tight font-semibold text-[17px]">Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="otp_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="tracking-tight font-semibold text-[17px]">Google Authenticator Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the 6-digit Code" {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-white text-black hover:bg-violet-500 text-[17px]"
              type="submit"
            >
              Submit
            </Button>
            <h3 className="tracking-tight text-lg">
              Haven&apos;t registered?{" "}
              <span>
                <Button onClick={() => navigate("/signup")} variant="link" className="hover:text-violet-500 tracking-tight text-lg uppercase">
                  REGISTER HERE!
                </Button>
              </span>
            </h3>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
