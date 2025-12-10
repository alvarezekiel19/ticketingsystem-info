import Link from "next/link";
import { FaTicketAlt } from "react-icons/fa";

const HomePage = () => {
    return (
        <main className='flex flex-col text-center items-center justify-center min-h-screen px-4'>
            <FaTicketAlt className='mx-auto mb-4 text-blue-500' size={60} />
            <h1 className='text-4xl md:text-5xl font-bold mb-4 text-blue-600'>
                Welcome to Informatics Support Ticket System
            </h1>
            <p className='text-lg text-gray-600 mb-8'>
                Fast and simple support ticket management system.
            </p>
        </main>
    );
};

export default HomePage;
