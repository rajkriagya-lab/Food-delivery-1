import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/auth/Input'
import Button from '../../components/auth/Button'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

export default function Register() {
    const { register, loading } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        register(formData, navigate);
    };

    return (
        <AuthLayout title="Create Account" subtitle="Register to Continue">
            <form onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange} 
                    type="text"
                    placeholder="Enter your name"
                />
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
                    {loading ? "Creating Account..." : "Register"}
                </Button>
            </form>

            <p className="text-center text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-white ml-2">
                    Login
                </Link>
            </p>
        </AuthLayout>
    )
}
