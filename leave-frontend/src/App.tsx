import "./App.css"
import { useEffect, useState } from "react"
import Dashboard from "./app/dashboard/Dashboard"
import Login from "./app/login/Login"
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'
import type { User } from "./types/types"
import ChangePassword from "./app/login/ChangePassword"
import toast from "react-hot-toast"

type Screen = "login" | "dashboard" | "changePassword";

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [authHeader, setAuthHeader] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("lm_user");
    const storedAuth = sessionStorage.getItem("lm_auth");
    if (storedUser && storedAuth) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    if (u.mustChangePassword) {
      setScreen("changePassword");
    } else {
      setScreen("dashboard");
    }
  };

  const handlePasswordChanged = () => {
    setUser(null);
    setAuthHeader(null);
    sessionStorage.clear();
    toast.success("Please log in with your new password.");
    setScreen("login");
  };

  const handleLogout = () => {
    setUser(null);
    setAuthHeader(null);
    sessionStorage.clear();
    setScreen("login");
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
      {screen === "login" && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {screen === "dashboard" && user && authHeader && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}

      {screen === "changePassword" && user && authHeader && (
        <ChangePassword
          user={user}
          authHeader={authHeader}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
    </>
  );
}

export default App;