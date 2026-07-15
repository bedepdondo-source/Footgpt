export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    try {
        const data = JSON.parse(event.body);
        if (!data.email) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email requis' })
            };
        }
        
        // This is a dummy function. In a real application, you'd save this to a database
        // or a service like Mailchimp.
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Inscription réussie' })
        };
    } catch (err) {
        console.error("Newsletter error", err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erreur Serveur' })
        };
    }
};
