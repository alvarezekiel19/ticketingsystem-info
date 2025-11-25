import { sql } from '@vercel/postgres';

export default async function DebugDB() {
  try {
    // Test connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    
    // Get Ticket table columns specifically
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Ticket'
      ORDER BY ordinal_position
    `;
    
    // Get sample data from Ticket table
    const sampleData = await sql`SELECT * FROM "Ticket" LIMIT 5`;

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Debug Info - Ticket Table</h1>
        
        <div className="mb-6 p-4 bg-green-100 rounded">
          <h2 className="text-lg font-semibold">✅ Database Connected</h2>
          <p>Current time: {connectionTest.rows[0].current_time.toString()}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Ticket Table Columns:</h2>
          <ul className="space-y-2">
            {columns.rows.map((col, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded">
                <strong>{col.column_name}</strong> ({col.data_type})
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Sample Ticket Data:</h2>
          <pre className="bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(sampleData.rows, null, 2)}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Debug Info</h1>
        <div className="p-4 bg-red-100 rounded">
          <h2 className="text-lg font-semibold">❌ Error</h2>
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }
}
