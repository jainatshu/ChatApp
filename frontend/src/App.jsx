import { useState } from 'react'

import './App.css'
import AppRoute from './routes/AppRoute'
import { UserProvider } from './context/User.context'


function App() {
  

  return (
    <UserProvider>
      <AppRoute />
    </UserProvider>
    
  )
}

export default App
