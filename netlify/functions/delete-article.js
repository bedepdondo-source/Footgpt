import fs from 'fs';
import path from 'path';

export const handler = async (event, context) => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer valid_admin_token')) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const dbPath = path.resolve(process.cwd(), 'db.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        const initialLength = data.articles.length;
        data.articles = data.articles.filter(a => a.id !== payload.id);
        
        if (data.articles.length === initialLength) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
        
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Deleted successfully' })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
