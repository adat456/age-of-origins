import { createContext } from "react";

const AuthenticatedContext = createContext<{id: string, username: string} | null>(null);

export default AuthenticatedContext;