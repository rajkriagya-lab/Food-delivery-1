import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/auth/Input'
import Button from '../../components/auth/Button'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 
        login(formData, navigate);
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Login to Continue">
            <form onSubmit={handleSubmit}>
                <Input
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter your email"
                />
                <Input
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Enter your password"
                />
                <Button disabled={loading}>
                    {loading ? "Please wait..." : "Login"}
                </Button>
            </form>

            <p className="text-center text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-white ml-2">
                    Register
                </Link>
            </p>
        </AuthLayout>
    )
}