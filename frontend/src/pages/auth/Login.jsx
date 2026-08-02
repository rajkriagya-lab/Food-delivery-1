import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/auth/Input'
import Button from '../../components/auth/Button'

export default function Login() {
  return (
    <AuthLayout title="Welcome Back" subtitle="Login to Continue">
      <form>
        <Input label="Email" type="email" placeholder="Enter your email" />
        <Input label="Password" type="password" placeholder="Enter your password" />
        <Button type="submit">Login</Button>
      </form>

      <p className="text-center text-gray-400 mt-6">
        Don’t have an account?{' '}
        <Link to="/register" className="text-white ml-2">
          Register
        </Link>
      </p>
    </AuthLayout>
  )
}
