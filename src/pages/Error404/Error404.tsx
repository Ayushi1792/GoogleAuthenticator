import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-7">
      <h3 className="tracking-tight text-4xl font-semibold">
        The requested URL could not be found:(
      </h3>
      <Button onClick={()=>navigate("/")} variant="link" className="tracking-tight text-lg hover:text-violet-500">Go to the Home Page</Button>
    </div>
  )
}

export default Error404