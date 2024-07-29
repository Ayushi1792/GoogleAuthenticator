import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { useAuthContext } from "@/context"

const navbar = () => {
  const navigate = useNavigate();
  const {isLogin, user, logout} = useAuthContext();
  return (
    <div className=" z-50 w-full flex px-20 py-5 fixed top-0 left-0 justify-between items-center">
      <Link to="/">
      <h1 className="tracking-tight font-semibold text-4xl hover:text-violet-500">HOME</h1>
      </Link>
        <div className="flex items-center gap-7">
          {isLogin ?(
<>
            <h3 className="tracking-tight text-lg font-semibold">
            Welcome <span className="text-violet-500">{user}</span>!
        </h3>
        <Button onClick={logout} className="tracking-tight text-[17px] bg-white text-black hover:bg-violet-500 rounded-full">
          Logout
        </Button>
        </>
          ):(
            <>
            <Button onClick={()=>navigate("/login")} className="tracking-tight text-[17px] bg-white text-black hover:bg-violet-500 rounded-full">
          Login
        </Button>
            
            <Button onClick={()=>navigate("/signup")} className="tracking-tight text-[17px] bg-white text-black hover:bg-violet-500 rounded-full">
          Signup
        </Button>
        </>
          )}
            
        </div>
    </div>

  )
}

export default navbar