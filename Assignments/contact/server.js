const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());

// Load contacts from file
const loadContacts = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Save contacts to file
const saveContacts = (contacts) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
};

// GET /contacts - Retrieve all contacts
app.get('/contacts', (req, res) => {
    const contacts = loadContacts();
    res.json(contacts);
});

// POST /contacts - Add a new contact
app.post('/contacts', (req, res) => {
    const { name, phone, image } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone number are required' });
    }
    
    let contacts = loadContacts();
    const id = contacts.length ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    contacts.push({ id, name, phone, image: image || null });
    
    // Sort contacts by name (ascending order)
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    saveContacts(contacts);
    res.json({ message: 'Contact added successfully' });
});

// PUT /contacts/:id - Update a contact
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, image } = req.body;
    let contacts = loadContacts();
    
    const contactIndex = contacts.findIndex(c => c.id == id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    contacts[contactIndex] = { id: parseInt(id), name, phone, image: image || null };
    
    // Sort contacts by name (ascending order)
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    saveContacts(contacts);
    res.json({ message: 'Contact updated successfully' });
});

// DELETE /contacts/:id - Remove a contact
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;
    let contacts = loadContacts();
    
    const newContacts = contacts.filter(c => c.id != id);
    if (contacts.length === newContacts.length) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    saveContacts(newContacts);
    res.json({ message: 'Contact deleted successfully' });
});

// GET /contacts/search - Search contacts by name or phone
app.get('/contacts/search', (req, res) => {
    const { name, phone } = req.query;
    let contacts = loadContacts();
    
    if (name) {
        contacts = contacts.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    }
    
    if (phone) {
        contacts = contacts.filter(c => c.phone.includes(phone));
    }
    
    res.json(contacts);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
