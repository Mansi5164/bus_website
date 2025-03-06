const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// File paths
const BUSES_FILE = path.join(__dirname, 'data', 'buses.txt');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.txt');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
    }
}

// Initialize files if they don't exist
async function initializeFiles() {
    await ensureDataDir();
    
    // Initialize buses.txt with sample data if it doesn't exist
    try {
        await fs.access(BUSES_FILE);
    } catch {
        const sampleBuses = [
            {
                id: 1,
                from: "Mumbai",
                to: "Delhi",
                departure: "21:00",
                price: 1500,
                seats: 45,
                operator: "IndiGo Bus Services",
                busType: "Sleeper AC",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17",
                    "2025-03-18",
                    "2025-03-19"
                ]
            },
            {
                id: 2,
                from: "Bangalore",
                to: "Chennai",
                departure: "20:30",
                price: 800,
                seats: 38,
                operator: "SRS Travels",
                busType: "Semi-Sleeper AC",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17",
                    "2025-03-18"
                ]
            },
            {
                id: 3,
                from: "Delhi",
                to: "Jaipur",
                departure: "19:00",
                price: 600,
                seats: 40,
                operator: "Rajasthan Travels",
                busType: "AC Seater",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17"
                ]
            },
            {
                id: 4,
                from: "Hyderabad",
                to: "Bangalore",
                departure: "22:00",
                price: 1200,
                seats: 35,
                operator: "Orange Travels",
                busType: "Volvo AC Sleeper",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17",
                    "2025-03-18"
                ]
            },
            {
                id: 5,
                from: "Kolkata",
                to: "Varanasi",
                departure: "20:00",
                price: 1100,
                seats: 42,
                operator: "Bengal Express",
                busType: "AC Sleeper",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17"
                ]
            },
            {
                id: 6,
                from: "Chennai",
                to: "Coimbatore",
                departure: "21:30",
                price: 750,
                seats: 36,
                operator: "KPN Travels",
                busType: "AC Semi-Sleeper",
                availableDates: [
                    "2025-03-16",
                    "2025-03-17",
                    "2025-03-15",
                    "2025-03-18"
                ]
            },
            {
                id: 7,
                from: "Pune",
                to: "Mumbai",
                departure: "18:00",
                price: 400,
                seats: 45,
                operator: "Purple Travels",
                busType: "AC Seater",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17"
                ]
            },
            {
                id: 8,
                from: "Ahmedabad",
                to: "Mumbai",
                departure: "20:00",
                price: 1000,
                seats: 40,
                operator: "Gujarat Travels",
                busType: "Volvo AC Sleeper",
                availableDates: [
                    "2025-03-15",
                    "2025-03-16",
                    "2025-03-17",
                    "2025-03-18"
                ]
            }
        ];
        await fs.writeFile(BUSES_FILE, JSON.stringify(sampleBuses, null, 2));
    }

    // Initialize empty bookings.txt if it doesn't exist
    try {
        await fs.access(BOOKINGS_FILE);
    } catch {
        await fs.writeFile(BOOKINGS_FILE, '[]');
    }
}

// Get all buses
app.get('/api/buses', async (req, res) => {
    try {
        const data = await fs.readFile(BUSES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading buses data' });
    }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading bookings data' });
    }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        // Read existing bookings
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const bookings = JSON.parse(bookingsData);
        
        // Read buses to verify availability
        const busesData = await fs.readFile(BUSES_FILE, 'utf8');
        const buses = JSON.parse(busesData);
        
        const bus = buses.find(b => b.id === parseInt(req.body.busId));
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        // Verify date availability
        if (!bus.availableDates.includes(req.body.date)) {
            return res.status(400).json({ error: 'Selected date not available' });
        }

        // Create new booking
        const newBooking = {
            id: Date.now().toString(),
            busId: parseInt(req.body.busId),
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            seats: parseInt(req.body.seats),
            date: req.body.date,
            status: 'confirmed',
            timestamp: new Date().toISOString()
        };

        // Update bus seats and dates
        const updatedBuses = buses.map(b => {
            if (b.id === newBooking.busId) {
                return {
                    ...b,
                    seats: b.seats - newBooking.seats,
                    availableDates: b.availableDates.filter(date => 
                        !(date === newBooking.date && b.seats - newBooking.seats < 1)
                    )
                };
            }
            return b;
        });

        // Save updated data
        bookings.push(newBooking);
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        await fs.writeFile(BUSES_FILE, JSON.stringify(updatedBuses, null, 2));

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: 'Error creating booking' });
    }
});

// Cancel booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        let bookings = JSON.parse(bookingsData);
        
        const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const cancelledBooking = bookings[bookingIndex];
        
        // Read buses to restore seats
        const busesData = await fs.readFile(BUSES_FILE, 'utf8');
        const buses = JSON.parse(busesData);
        
        // Update bus seats and dates
        const updatedBuses = buses.map(b => {
            if (b.id === cancelledBooking.busId) {
                return {
                    ...b,
                    seats: b.seats + cancelledBooking.seats,
                    availableDates: [...new Set([...b.availableDates, cancelledBooking.date])]
                };
            }
            return b;
        });

        // Remove booking
        bookings.splice(bookingIndex, 1);
        
        // Save updated data
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        await fs.writeFile(BUSES_FILE, JSON.stringify(updatedBuses, null, 2));

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error cancelling booking' });
    }
});

// Update booking
app.put('/api/bookings/:id', async (req, res) => {
    try {
        // Read existing bookings
        const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
        const bookings = JSON.parse(bookingsData);
        
        // Find the booking to update
        const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const oldBooking = bookings[bookingIndex];
        
        // Read buses to verify availability
        const busesData = await fs.readFile(BUSES_FILE, 'utf8');
        const buses = JSON.parse(busesData);
        
        const bus = buses.find(b => b.id === oldBooking.busId);
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        // Verify date availability
        if (!bus.availableDates.includes(req.body.date)) {
            return res.status(400).json({ error: 'Selected date not available' });
        }

        // Calculate seat difference
        const seatDiff = req.body.seats - oldBooking.seats;
        if (seatDiff > 0 && bus.seats < seatDiff) {
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        // Update booking
        const updatedBooking = {
            ...oldBooking,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            seats: parseInt(req.body.seats),
            date: req.body.date
        };

        // Update bus seats
        const updatedBuses = buses.map(b => {
            if (b.id === oldBooking.busId) {
                return {
                    ...b,
                    seats: b.seats - seatDiff,
                    availableDates: b.availableDates.filter(date => 
                        !(date === req.body.date && b.seats - seatDiff < 1)
                    )
                };
            }
            return b;
        });

        // Save updated data
        bookings[bookingIndex] = updatedBooking;
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        await fs.writeFile(BUSES_FILE, JSON.stringify(updatedBuses, null, 2));

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ error: 'Error updating booking' });
    }
});

// Initialize files and start server
initializeFiles().then(() => {
    app.listen(port, () => {
        console.log(`Bus booking server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Error initializing server:', error);
}); 