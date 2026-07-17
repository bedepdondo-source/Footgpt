export const handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'API key is missing' })
        };
    }

    try {
        const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.error("Live scores error", err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erreur Serveur lors de la récupération des scores' })
        };
    }
};
