const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read contacts
async function readContacts() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write contacts
async function writeContacts(contacts) {
    await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2));
}

// 1. List Contacts - GET /contacts
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await readContacts();
        // Sort contacts by name in ascending order
        contacts.sort((a, b) => a.name.localeCompare(b.name));
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching contacts' });
    }
});

// 2. Add Contact - POST /contacts
app.post('/addContacts', async (req, res) => {
    try {
        const { name, phone, image } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        const contacts = await readContacts();
        const newContact = {
            id: Date.now().toString(),
            name,
            phone,
            image: image || null
        };

        contacts.push(newContact);
        await writeContacts(contacts);
        res.status(201).json({ message: 'Contact added successfully', contact: newContact });
    } catch (error) {
        res.status(500).json({ error: 'Error adding contact' });
    }
});

// 3. Update Contact - PUT /contacts/:id
app.put('/Updatecontacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, image } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        const contacts = await readContacts();
        const contactIndex = contacts.findIndex(contact => contact.id === id);

        if (contactIndex === -1) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        contacts[contactIndex] = {
            ...contacts[contactIndex],
            name,
            phone,
            image: image || contacts[contactIndex].image
        };

        await writeContacts(contacts);
        res.json({ message: 'Contact updated successfully', contact: contacts[contactIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Error updating contact' });
    }
});

// 4. Delete Contact - DELETE /contacts/:id
app.delete('/deleteContacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const contacts = await readContacts();
        const contactIndex = contacts.findIndex(contact => contact.id === id);

        if (contactIndex === -1) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        contacts.splice(contactIndex, 1);
        await writeContacts(contacts);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting contact' });
    }
});

// 5. Search Contact - GET /contacts/search
app.get('/contacts/search', async (req, res) => {
    try {
        const { name, phone } = req.query;
        const contacts = await readContacts();
        
        let filteredContacts = contacts;

        if (name) {
            filteredContacts = filteredContacts.filter(contact =>
                contact.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (phone) {
            filteredContacts = filteredContacts.filter(contact =>
                contact.phone.includes(phone)
            );
        }

        res.json(filteredContacts);
    } catch (error) {
        res.status(500).json({ error: 'Error searching contacts' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('1. GET /contacts - List all contacts');
    console.log('2. POST /contacts - Add new contact');
    console.log('3. PUT /contacts/:id - Update contact');
    console.log('4. DELETE /contacts/:id - Delete contact');
    console.log('5. GET /contacts/search - Search contacts');
}); 