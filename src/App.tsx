import Home  from "./pages/Home/Home"
import { Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login/Login"
import Signup from "./pages/Signup/Signup"
import Error404 from "./pages/Error404/Error404"
import Navbar from "./components/Navbar"
import Landing from "./pages/Landing/Landing"
import { useState, useEffect } from "react"
import { AuthContextProvider } from "./context"

const App = () => {
  const [user, setUser] = useState<String | null>(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user).message);
      setIsLogin(true);
    }
  }, []);

  const login = (user: String | null) => {
    setUser(user);
    setIsLogin(true);
  };

  const logout = () => {
    setIsLogin(false);
    localStorage.clear();
  };

  return (
    <AuthContextProvider value={{user,isLogin,login, logout}}>
      < Navbar />
      <Routes>
        <Route path="/" element={isLogin?<Landing/>:<Home/>}/>
        <Route path="/login" element={isLogin?<Navigate to="/landing"/>:<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/*" element={<Error404/>}/>
      </Routes>
    </AuthContextProvider>   
  )
}

export default App