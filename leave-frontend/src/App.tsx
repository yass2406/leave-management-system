import "./App.css"
import { useEffect, useState } from "react"
import Dashboard from "./app/dashboard/Dashboard"
import Login from "./app/login/Login"
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'
import type { User } from "./types/types"

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authHeader, setAuthHeader] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("lm_user");
    const storedAuth = sessionStorage.getItem("lm_auth");
    if (storedUser && storedAuth) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        setAuthHeader(storedAuth);
      } catch {
        sessionStorage.removeItem("lm_user");
        sessionStorage.removeItem("lm_auth");
      }
    }
    setBootstrapped(true);
  }, []);

  const handleLoginSuccess = (u: User, header: string) => {
    setUser(u);
    setAuthHeader(header);
    sessionStorage.setItem("lm_user", JSON.stringify(u));
    sessionStorage.setItem("lm_auth", header);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthHeader(null);
    sessionStorage.removeItem("lm_user");
    sessionStorage.removeItem("lm_auth");
  };

  if (!bootstrapped) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Quantum
          size="45"
          speed="1.75"
          color="#FFFFFF"
        />
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;