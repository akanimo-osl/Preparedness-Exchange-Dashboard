import type React from "react"
import { Link, useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from "react"
import type { LoginResponse } from "@/types/auth_type";
interface AuthDataContextType {
  user: LoginResponse["data"]["user"] | null
  clear: () => void
  set: (userData: LoginResponse["data"]["user"]) => void
}

const AuthContext = createContext<AuthDataContextType | undefined>(undefined)

export function AuthDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse["data"]["user"] | null>(null)
  const KEY = 'whodatarepruser'

  useEffect(() => {
    const savedUser = localStorage.getItem(KEY)
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const set = (userData: any) => {
    setUser(userData)
    localStorage.setItem(KEY, JSON.stringify(userData))
  }

  const clear = () => {
    setUser(null)
    localStorage.removeItem(KEY)
  }

  return <AuthContext.Provider value={{ user, set, clear }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
