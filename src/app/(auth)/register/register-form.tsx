'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/actions/auth.actions';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

const RegisterForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const initialState = {
        success: false,
        message: '',
    };

    const [state, formAction] = useActionState(registerUser, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message || 'Registration successful!');
            // Redirect to login page
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else if (state.message) {
            toast.error(state.message);
            setIsLoading(false);
        }
    }, [state, router]);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        formAction(formData);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-blue-50 px-4'>
            <div className='w-full max-w-md bg-white shadow-md rounded-lg p-8 border border-gray-200'>
                <h1 className='text-3xl font-bold mb-6 text-center text-blue-600'>
                    Register
                </h1>

                <form action={handleSubmit} className='space-y-4 text-gray-700'>
                    <input
                        className='w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100'
                        type='text'
                        name='name'
                        placeholder='Your Name'
                        required
                        disabled={isLoading}
                    />
                    <input
                        className='w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100'
                        type='email'
                        name='email'
                        placeholder='Your Email'
                        required
                        disabled={isLoading}
                    />
                    <input
                        className='w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100'
                        type='password'
                        name='password'
                        placeholder='Password'
                        required
                        disabled={isLoading}
                    />

                    {/* Admin Approval Notice */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    After registration, your account will need admin approval before you can access the ticketing system.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        className={`w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-500 hover:text-blue-700 font-medium">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
