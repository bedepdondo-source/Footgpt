import fs from 'fs';
import path from 'path';

export const handler = async (event, context) => {
    try {
        const dbPath = path.resolve(process.cwd(), 'db.json');
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        const data = JSON.parse(dbContent);
        
        const type = event.queryStringParameters?.type;
        
        let responseData;
        if (type === 'external') {
            responseData = data.external_news || [];
        } else if (type === 'matches') {
            responseData = data.matches || [];
        } else {
            responseData = data.articles || [];
            // Sort by date descending
            responseData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData)
        };
    } catch (error) {
        console.error("Error reading DB:", error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to read data' }) };
    }
};
