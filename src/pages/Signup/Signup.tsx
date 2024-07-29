import { useState } from "react";
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

const formSchema = z.object({
  email: z.string().min(2, { message: "This is a required field" }).email(),
  password: z.string().min(2, { message: "This is a required field" }),
  username: z.string().min(2, { message: "This is a required field" }),
});

const Signup = () => {
  const navigate = useNavigate();
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("http://localhost:8000/register", {
        username: values.username,
        password: values.password,
        email: values.email,
      });

      const responseData = response.data;
      console.log("Registration successful:", responseData);

      if (responseData.qr_code_data_uri) {
        setQrCodeUri(responseData.qr_code_data_uri);
      }

      if (responseData.secret_key) {
        setSecretKey(responseData.secret_key);
      }

      setSuccessMessage("Registration successful! Please scan the QR code with your authenticator app.");
      form.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Registration error:", error.response.data);
          setErrorMessage(error.response.data.error || "Registration failed. Please try again.");
        } else if (error.request) {
          console.error("No response received:", error.request);
          setErrorMessage("No response from server. Please check your connection and try again.");
        } else {
          console.error("Error", error.message);
          setErrorMessage("An error occurred. Please try again.");
        }
      } else {
        console.error("Non-Axios error:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[435px] min-h-[30rem] flex flex-col gap-7 rounded-3xl border-white border-[0.1rem] p-6">
        {!successMessage ? (
          <>
            <h1 className="tracking-tight text-3xl font-semibold flex justify-center">
              Create a new account
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
                        <Input placeholder="John Doe" {...field} />
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tracking-tight font-semibold text-[17px]">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@gmail.com" {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full bg-white text-black hover:bg-violet-500 text-[17px]" type="submit">
                  Submit
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Scan this QR Code</h2>
            {qrCodeUri && (
              <img src={qrCodeUri} alt="QR Code" style={{ width: '200px', height: '200px' }} className="mx-auto" />
            )}
            {secretKey && (
              <pre className="mt-2">Your secret key: {secretKey}</pre>
            )}
            <h3 className="tracking-tight text-lg mt-4">
              Scanned the QR Code?{" "}
              <span>
                <Button onClick={() => navigate("/login")} variant="link" className="hover:text-violet-500 tracking-tight text-lg uppercase">
                  Login Here!
                </Button>
              </span>
            </h3>
          </>
        )}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Signup;
