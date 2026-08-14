import { createContext } from "react";

export const AuthContext=createContext(null)


export function AuthProvider({children}){
  return
  <AuthContext.Provider value="hello" > {children} </AuthContext.Provider>
}