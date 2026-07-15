import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Shim Netlify Functions
app.all('/.netlify/functions/:functionName', async (req, res) => {
  try {
    const funcName = req.params.functionName;
    const funcPath = path.join(process.cwd(), 'netlify', 'functions', `${funcName}.js`);
    
    if (!fs.existsSync(funcPath)) {
      return res.status(404).json({ error: 'Function not found' });
    }
    
    // Cache bust by adding timestamp for development
    const func = await import(`file://${funcPath}?update=${Date.now()}`);
    
    const event = {
      httpMethod: req.method,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null,
      queryStringParameters: req.query,
      headers: req.headers
    };
    
    const response = await func.handler(event, {});
    
    if (response.headers) {
      Object.keys(response.headers).forEach(k => res.setHeader(k, response.headers[k]));
    }
    
    res.status(response.statusCode || 200).send(response.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback to index.html for SPA-like behavior if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express simulation server running on port ${PORT}`);
});
