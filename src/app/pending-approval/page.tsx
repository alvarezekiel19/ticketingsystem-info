export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Account Pending Approval
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Your account is waiting for administrator approval.
                        You will be able to access the ticket system once approved.
                    </p>

                    <div className="space-y-3">
                        <a
                            href="/login"
                            className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                        >
                            Return to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
