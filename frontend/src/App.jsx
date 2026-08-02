import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'

export default function App() {
  return (
    <div className='min-h-screen bg-primary text-white'>
      <Toaster position='top Right' />
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  )
}
