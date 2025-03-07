const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());

const PRODUCTS_FILE = 'products.json';
const REVIEWS_FILE = 'reviews.json';

// Helper functions to read and write data
const loadData = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file));
};

const saveData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Ensure JSON files exist
if (!fs.existsSync(PRODUCTS_FILE)) saveData(PRODUCTS_FILE, []);
if (!fs.existsSync(REVIEWS_FILE)) saveData(REVIEWS_FILE, []);

// Add a new product
app.post('/products', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) return res.status(400).json({ error: "Name and description required" });

    const products = loadData(PRODUCTS_FILE);
    const newProduct = { id: uuidv4(), name, description, averageRating: 0 };
    products.push(newProduct);
    saveData(PRODUCTS_FILE, products);

    res.json(newProduct);
});

// Get all products (sorted by rating if specified)
app.get('/products', (req, res) => {
    let products = loadData(PRODUCTS_FILE);
    if (req.query.sortBy === 'rating') {
        products.sort((a, b) => b.averageRating - a.averageRating);
    }
    res.json(products);
});

// Submit a review
app.post('/reviews', (req, res) => {
    const { productId, rating, message } = req.body;
    if (!productId || !rating || !message) return res.status(400).json({ error: "Product ID, rating, and message required" });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5" });

    const products = loadData(PRODUCTS_FILE);
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const reviews = loadData(REVIEWS_FILE);
    const newReview = { id: uuidv4(), productId, timestamp: new Date().toISOString(), rating, message };
    reviews.push(newReview);
    saveData(REVIEWS_FILE, reviews);

    // Update product's average rating
    const productReviews = reviews.filter(r => r.productId === productId);
    product.averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    saveData(PRODUCTS_FILE, products);

    res.json(newReview);
});

// Get recent reviews
app.get('/reviews', (req, res) => {
    const reviews = loadData(REVIEWS_FILE).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(reviews);
});

// Get product details with reviews
app.get('/products/:id', (req, res) => {
    const products = loadData(PRODUCTS_FILE);
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const reviews = loadData(REVIEWS_FILE).filter(r => r.productId === product.id);
    res.json({ ...product, reviews });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




// for add data
// {
//     "id": "1234-uuid",
//     "name": "Laptop",
//     "description": "Gaming Laptop",
//     "averageRating": 0
//   }
  