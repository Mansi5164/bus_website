const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DOCUMENTS_FILE = path.join(__dirname, 'documents.json');
const SEARCHES_FILE = path.join(__dirname, 'searches.json');

app.use(bodyParser.json());

// Load data from file
const loadData = (file) => {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file));
};

// Save data to file
const saveData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// POST /documents - Add a new document
app.post('/documents', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    const documents = loadData(DOCUMENTS_FILE);
    const id = uuidv4();
    documents[id] = { id, content };
    saveData(DOCUMENTS_FILE, documents);
    
    res.json({ id, content });
});

// GET /documents/:id - Retrieve a document
app.get('/documents/:id', (req, res) => {
    const documents = loadData(DOCUMENTS_FILE);
    const document = documents[req.params.id];
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    res.json(document);
});

// POST /searches - Submit a search query
app.post('/searches', (req, res) => {
    const { documentId, term } = req.body;
    if (!documentId || !term) return res.status(400).json({ error: 'Document ID and search term are required' });
    
    const documents = loadData(DOCUMENTS_FILE);
    if (!documents[documentId]) return res.status(404).json({ error: 'Document not found' });
    
    const searches = loadData(SEARCHES_FILE);
    const searchId = uuidv4();
    searches[searchId] = { id: searchId, documentId, term };
    saveData(SEARCHES_FILE, searches);
    
    res.json({ id: searchId, documentId, term });
});

// GET /searches/:id/solve - Retrieve search results
// app.get('/searches/:id/solve', (req, res) => {
//     const searches = loadData(SEARCHES_FILE);
//     const search = searches[req.params.id];
//     if (!search) return res.status(404).json({ error: 'Search not found' });
    
//     const documents = loadData(DOCUMENTS_FILE);
//     const document = documents[search.documentId];
//     if (!document) return res.status(404).json({ error: 'Document not found' });
    
//     const positions = [];
//     let index = document.content.indexOf(search.term);
//     while (index !== -1) {
//         positions.push(index);
//         index = document.content.indexOf(search.term, index + 1);
//     }
    
//     res.json({ term: search.term, positions });
// });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});