import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/auth/Input'
import Button from '../../components/auth/Button'
import React from 'react'

export default function Register() {
    const { register, loading } = userAuthStore();
    const navigate = useNavigate();
    const [fromData, setFromData] = userState({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const handleChange = (e) => {
        setFormData({ ...fromData, [e.target, name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefult();
        register(fromData, navigate);
    };
    return (
        <AuthLayout title="Create Account" subtitle="Register to Continue">
            <form>
                <Input label="Full Name" type="text" placeholder="Enter your name" />
                <Input label="Email" type="email" placeholder="Enter your email" />
                <Input label="Password" type="password" placeholder="Enter your password" />

                <div className="mb-6">
                    <label className="block text-white mb-2">Role</label>
                    <select className="w-full bg-primary text-white rounded-lg p-3 border border-gray-700">
                        <option value="">Select Role</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="RESTURANT_OWNER">Restaurant Owner</option>
                    </select>
                </div>

                <Button type="submit">Register</Button>
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
