import dotenv from 'dotenv';
dotenv.config();

export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    try {
        const { password } = JSON.parse(event.body);
        const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (password === correctPassword) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: 'valid_admin_token_2023', message: 'Success' })
            };
        } else {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid password' })
            };
        }
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
    }
};
