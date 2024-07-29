import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className="w-full h-screen flex flex-col gap-7 justify-center items-center">
      {isLogin? (
<>
<h1 className=" tracking-tight text-4xl">This is a Google Authenticator  Page built on MERN.</h1>
              <Button onClick={()=>navigate("/home")} variant="link" className="tracking-tight text-lg hover:text-violet-500" > Click here to Logout!</Button>
</>        
      ):(
       <>
       <h1 className=" tracking-tight text-4xl">This is a Google Authenticator Login Page built on MERN.</h1>
       <Button onClick={()=>navigate("/signup")} variant="link" className="tracking-tight text-lg hover:text-violet-500" > Click here to Signup!</Button>
       </> 
      )}

    </div>
  )
}

export default Home