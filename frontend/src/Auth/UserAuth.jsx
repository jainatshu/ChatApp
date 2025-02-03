import React, { useContext, useEffect, useState, } from 'react'
import { UserContext } from '../context/User.context'
import { useNavigate } from 'react-router-dom';
import Login from '../screens/Login';

const UserAuth = ({children}) => {
    const {user} = useContext(UserContext);
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(()=>{
        if (token && user) {
        setLoading(false); // Authenticated
        } else {
        navigate("/login"); // Redirect to login if not authenticated
        }
    },[user, token, navigate])
    if(loading){
        return <div>Loading.... Auth</div>
    }
  return (
   <>
   {children}
   </>
  )
}

export default UserAuth