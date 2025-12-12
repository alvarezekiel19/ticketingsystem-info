/* eslint-disable react-hooks/error-boundaries */
import { sql } from "@vercel/postgres";
import SearchTickets from "@/components/SearchTickets";

interface TicketsPageProps {
    searchParams: Promise<{ query?: string }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
    const params = await searchParams;
    const query = params?.query || "";

    try {
        let tickets;

        if (query) {
            const searchTerm = `%${query}%`;
            const searchResult = await sql`
                SELECT * FROM "Ticket" 
                WHERE 
                    LOWER("subject") LIKE LOWER(${searchTerm}) OR
                    LOWER("description") LIKE LOWER(${searchTerm}) OR
                    LOWER("status") LIKE LOWER(${searchTerm}) OR
                    LOWER("priority") LIKE LOWER(${searchTerm})
                ORDER BY "createdAt" DESC
                LIMIT 100
            `;
            tickets = searchResult.rows;
        } else {
            // Simple parameterized query for all tickets
            const result = await sql`
                SELECT * FROM "Ticket" 
                ORDER BY "createdAt" DESC 
                LIMIT 100
            `;
            tickets = result.rows;
        }

        return (
            <div className="min-h-screen bg-blue-50 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
                        Support Tickets
                    </h1>

                    <div className="max-w-md mx-auto mb-8">
                        <SearchTickets initialQuery={query} />
                    </div>

                    {tickets.length === 0 ? (
                        <p className="text-center text-gray-600">
                            {query
                                ? `No tickets found for "${query}"`
                                : "No Tickets Yet"}
                        </p>
                    ) : (
                        // eslint-disable-next-line react-hooks/error-boundaries
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="bg-white rounded-lg shadow-md p-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {ticket.subject ||
                                                    ticket.name ||
                                                    "Untitled Ticket"}
                                            </h3>
                                            <p className="text-gray-600 mt-2">
                                                {ticket.description ||
                                                    ticket.content ||
                                                    ticket.body ||
                                                    "No description"}
                                            </p>
                                            <div className="flex items-center mt-4 space-x-4 flex-wrap">
                                                {" "}
                                                {/* Status Badge - Now in the info row */}{" "}
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status ===
                                                        "solved"
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : "bg-blue-100 text-blue-800 border border-blue-200"
                                                        }`}
                                                >
                                                    {" "}
                                                    {ticket.status === "solved"
                                                        ? "✅ Solved"
                                                        : "🔧 Open"}{" "}
                                                </span>{" "}
                                                {/* Priority Badge */}{" "}
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.priority ===
                                                        "High"
                                                        ? "bg-red-100 text-red-800"
                                                        : ticket.priority ===
                                                            "Medium"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {" "}
                                                    {ticket.priority} priority
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(
                                                        ticket.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`/tickets/${ticket.id}`}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in tickets page:", error);
        return (
            <div className="min-h-screen bg-blue-50 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
                        Support Tickets
                    </h1>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>Error loading tickets: {error instanceof Error ? error.message : String(error)}</p>
                    </div>
                </div>
            </div>
        );
    }
}
