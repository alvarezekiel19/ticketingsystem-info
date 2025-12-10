'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes('pending admin approval')) {
                    setError('Your account is pending admin approval. Please wait for an administrator to activate your account.');
                } else {
                    setError('Invalid email or password');
                }
                setLoading(false);
                return;
            }

            // Login successful - redirect to tickets
            window.location.href = '/tickets';

        } catch (err: any) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-blue-50 px-4'>
            <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8 border border-gray-200'>
                <h1 className='text-3xl font-bold mb-6 text-center text-blue-600'>
                    Login
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4 text-gray-700'>
                    <input
                        className='w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400'
                        type='email'
                        name='email'
                        placeholder='Your Email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        className='w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400'
                        type='password'
                        name='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <button
                        className={`w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition disabled:opacity-50 ${loading ? 'cursor-not-allowed' : ''}`}
                        type='submit'
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-500 hover:text-blue-700 font-medium">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
