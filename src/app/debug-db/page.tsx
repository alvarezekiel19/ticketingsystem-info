import { sql } from '@vercel/postgres';

export default async function DebugUsers() {
  try {
    const users = await sql`SELECT * FROM "User" LIMIT 10`;
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Users in Database</h1>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(users.rows, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Users in Database</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }
}
