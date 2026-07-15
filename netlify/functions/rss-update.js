import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export const handler = async (event, context) => {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL('https://www.lequipe.fr/rss/actu_rss_Football.xml');
        
        const external_news = feed.items.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet || ''
        }));
        
        const dbPath = path.resolve(process.cwd(), 'db.json');
        let data = { articles: [], external_news: [], matches: [] };
        
        if (fs.existsSync(dbPath)) {
            data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
        
        data.external_news = external_news;
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'RSS updated successfully', count: external_news.length })
        };
    } catch (error) {
        console.error("RSS Update Error:", error);
        // Do not crash the frontend if RSS fails, just return empty success or a graceful error
        return { 
            statusCode: 200, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to update RSS, using stale data', message: error.message }) 
        };
    }
};
