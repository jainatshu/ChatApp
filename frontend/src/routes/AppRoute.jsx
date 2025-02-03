import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import UserAuth from "../Auth/UserAuth";


const AppRoute = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path = '/' element={<UserAuth> <Home /> </UserAuth>} />
            <Route path = '/login' element={<Login />} />
            <Route path = '/register' element={<Register />} />
            <Route path = '/project' element={ <Project /> }/>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoute