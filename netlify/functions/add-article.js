import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event, context) => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer valid_admin_token')) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const dbPath = path.resolve(process.cwd(), 'db.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        const newArticle = {
            id: uuidv4(),
            title: payload.title,
            content: payload.content,
            category: payload.category,
            image: payload.image,
            date: payload.date || new Date().toISOString()
        };
        
        data.articles = data.articles || [];
        data.articles.push(newArticle);
        
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newArticle)
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
