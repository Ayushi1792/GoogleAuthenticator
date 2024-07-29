import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('authToken'); // or any other method you use for authentication
      navigate("/login"); // adjust the path as needed
    }, 120 * 1000); // 2 minutes

    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Cleanup the timer and interval if the component unmounts
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-7 relative">
      <div className="absolute bottom-4 left-4 text-xl">
        {`Time left: ${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}`}
      </div>
      <h1 className="tracking-tight text-4xl font-semibold">
        You have Logged In Successfully!
      </h1>
    </div>
  );
}

export default Landing