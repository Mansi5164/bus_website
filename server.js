const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Path to the reviews.json file
const reviewsFilePath = path.join(__dirname, "review.json");

// Function to read reviews from the JSON file
const readReviewsFromFile = () => {
    if (!fs.existsSync(reviewsFilePath)) {
        return []; // Return an empty array if the file doesn't exist
    }
    const data = fs.readFileSync(reviewsFilePath);
    return JSON.parse(data);
};

// Function to write reviews to the JSON file
const writeReviewsToFile = (reviews) => {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
};

// *Fix: Root Route Added*
app.get("/", (req, res) => {
    res.send("Welcome to the Reviews API! Available routes: /add-review, /reviews, /median-rating");
});

// Route to add a review
app.post("/add-review", (req, res) => {
    const { service, route, rating, comments } = req.body;
    if (!service || !route || rating < 1 || rating > 10) {
        return res.status(400).json({ error: "Invalid input. Rating must be between 1 and 10, and service and route must be provided." });
    }

    // Read existing reviews
    const reviews = readReviewsFromFile();

    // Store the new review
    reviews.push({ service, route, rating, comments });
    writeReviewsToFile(reviews);

    console.log("New Review Added:", { service, route, rating, comments });
    res.json({ message: "Review added successfully!" });
});

// Route to fetch all reviews
app.get("/reviews", (req, res) => {
    const reviews = readReviewsFromFile();
    console.log("All Reviews:", reviews);
    res.json(reviews);
});

// Function to calculate median rating
function median(ratings) {
    ratings.sort((a, b) => a - b);
    let mid = Math.floor(ratings.length / 2);
    return ratings.length % 2 === 0
        ? (ratings[mid - 1] + ratings[mid]) / 2
        : ratings[mid];
}

// Route to get median rating
app.get("/median-rating", (req, res) => {
    const reviews = readReviewsFromFile();
    const ratings = reviews.map(r => r.rating);
    let med = median(ratings);
    console.log("Median Rating:", med);
    res.json({ median: med });
});

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:${PORT}');
});