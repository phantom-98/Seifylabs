'use client';
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ContextValue, User } from "utils/types";

const AppContext = createContext<ContextValue>({});

export const AppProvider = ({children}) => {
    const [user, setUser] = useState<User>();
    const router = useRouter();

    const checkIfAuthenticated = () => {
        setTimeout(() => {
            if (user === null) {
                toast.error("You need to signin first!")
                router.push("/", {scroll: false});
            }
        }, 1000);
    }

    useEffect(() => {
        const json = localStorage.getItem("user");
        if (json !== undefined)
            setUser(json ? JSON.parse(json) : null);
    }, [])

    return (
        <AppContext.Provider value={{
            user,
            setUser,
            checkIfAuthenticated
        }}>
            <ToastContainer theme="colored"/>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
      throw new Error("useApp must be used within a AppProvider");
    }
    return context;
};

export default useApp;