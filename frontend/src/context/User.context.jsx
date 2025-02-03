import React, {useContext, useState, createContext,useEffect} from "react";
import axiosInstance from "../config/axios";
export const UserContext = createContext();

export const UserProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axiosInstance.get('/users/curr-user');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Error fetching user:', error.response?.data || error.message);
                    localStorage.removeItem('token'); // Clear invalid token
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // No token, stop loading
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Loading indicator while fetching user
    }
    return (
        <UserContext.Provider value={{user,setUser}} >
            {children}
        </UserContext.Provider>
    )
}
[]
export const useUser = () =>{
    return useContext(UserContext)
}
