// Global variables
let selectedBus = null;
let allBuses = [];
let bookings = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadBuses();
        await loadBookings();
        setMinDate();
        displayAllBuses(); // Show all buses initially
        
        // Add event listener for search form
        document.querySelector('.search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            searchBuses();
        });
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
});

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
}

// Load buses from the server
async function loadBuses() {
    try {
        const response = await fetch('/api/buses');
        if (!response.ok) {
            throw new Error('Failed to fetch buses');
        }
        allBuses = await response.json();
        console.log('Loaded buses:', allBuses); // Debug log
    } catch (error) {
        console.error('Error loading buses:', error);
        showError('Failed to load buses. Please try again later.');
        throw error;
    }
}

// Load bookings from the server
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings');
        bookings = await response.json();
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Failed to load bookings. Please try again later.');
    }
}

// Display all buses on the home page
function displayAllBuses() {
    const busesList = document.getElementById('buses-list');
    if (allBuses.length === 0) {
        busesList.innerHTML = '<div class="no-results"><i class="fas fa-bus"></i><p>No buses available at the moment.</p></div>';
        return;
    }

    busesList.innerHTML = '<div class="buses-grid">' + allBuses.map(bus => `
        <div class="bus-card">
            <div class="bus-header">
                <span class="bus-type">${bus.busType}</span>
                <span class="route-price">₹${bus.price}</span>
            </div>
            <div class="bus-route">
                <div class="route-from">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${bus.from}</span>
                </div>
                <div class="route-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="route-to">
                    <i class="fas fa-map-marker"></i>
                    <span>${bus.to}</span>
                </div>
            </div>
            <div class="bus-details">
                <p><i class="fas fa-clock"></i> Departure: ${bus.departure}</p>
                <p><i class="fas fa-chair"></i> Available Seats: ${bus.seats}</p>
                <p><i class="fas fa-bus"></i> Operator: ${bus.operator}</p>
            </div>
            <div class="available-dates">
                <p><i class="fas fa-calendar-check"></i> Available Dates:</p>
                ${bus.availableDates.map(date => `<span class="date-tag">${formatDate(date)}</span>`).join('')}
            </div>
            <div class="button-group">
                <button class="btn-primary" onclick="showBusDetails(${bus.id})">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn-secondary" onclick="selectBus(${bus.id})">
                    <i class="fas fa-ticket-alt"></i> Book Now
                </button>
            </div>
        </div>
    `).join('') + '</div>';
}

// Display featured routes
function displayFeaturedRoutes() {
    const featuredRoutes = [
        { from: 'Mumbai', to: 'Delhi', price: '₹1200' },
        { from: 'Bangalore', to: 'Chennai', price: '₹900' },
        { from: 'Kolkata', to: 'Varanasi', price: '₹1100' }
    ];

    const featuredSection = document.createElement('section');
    featuredSection.className = 'featured-routes';
    featuredSection.innerHTML = `
        <h2><i class="fas fa-star"></i> Featured Routes</h2>
        <div class="featured-grid">
            ${featuredRoutes.map(route => `
                <div class="featured-card">
                    <div class="route-info">
                        <div class="route-from">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${route.from}</span>
                        </div>
                        <div class="route-arrow">
                            <i class="fas fa-arrow-right"></i>
                        </div>
                        <div class="route-to">
                            <i class="fas fa-map-marker"></i>
                            <span>${route.to}</span>
                        </div>
                        <div class="route-price">
                            <i class="fas fa-tag"></i>
                            <span>${route.price}</span>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="searchRoute('${route.from}', '${route.to}')">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    const searchSection = document.getElementById('search-section');
    searchSection.insertBefore(featuredSection, searchSection.firstChild);
}

// Search for a specific route
function searchRoute(from, to) {
    document.getElementById('from').value = from;
    document.getElementById('to').value = to;
    searchBuses();
}

// Show bus details in modal
function showBusDetails(busId) {
    const bus = allBuses.find(b => b.id === busId);
    if (!bus) return;

    const modalContent = document.getElementById('bus-details-content');
    modalContent.innerHTML = `
        <div class="modal-bus-details">
            <h3>${bus.from} to ${bus.to}</h3>
            <p><i class="fas fa-bus"></i> ${bus.operator}</p>
            <p><i class="fas fa-couch"></i> ${bus.busType}</p>
            <p><i class="fas fa-clock"></i> Departure: ${bus.departure}</p>
            <p><i class="fas fa-chair"></i> Available Seats: ${bus.seats}</p>
            <p><i class="fas fa-rupee-sign"></i> Price: ₹${bus.price}</p>
            <div class="available-dates">
                <p><i class="fas fa-calendar-check"></i> Available Dates:</p>
                ${bus.availableDates.map(date => `<span class="date-tag">${formatDate(date)}</span>`).join('')}
            </div>
        </div>
    `;

    selectedBus = bus;
    document.getElementById('bus-details-modal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('bus-details-modal').classList.add('hidden');
}

// Book selected bus from modal
function bookSelectedBus() {
    closeModal();
    selectBus(selectedBus.id);
}

// Format date for display
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Search buses based on criteria
function searchBuses() {
    console.log('Search function called'); // Debug log
    
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const date = document.getElementById('date').value;

    console.log('Search criteria:', { from, to, date }); // Debug log
    console.log('Available buses:', allBuses); // Debug log

    if (!from && !to && !date) {
        showError('Please enter at least one search criteria');
        return;
    }

    const filteredBuses = allBuses.filter(bus => {
        const matchFrom = !from || bus.from.toLowerCase().includes(from.toLowerCase());
        const matchTo = !to || bus.to.toLowerCase().includes(to.toLowerCase());
        const matchDate = !date || bus.availableDates.includes(date);
        return matchFrom && matchTo && matchDate;
    });

    console.log('Filtered buses:', filteredBuses); // Debug log

    displaySearchResults(filteredBuses);
}

// Display search results
function displaySearchResults(buses) {
    const busesList = document.getElementById('buses-list');
    
    if (!busesList) {
        console.error('buses-list element not found');
        return;
    }

    if (buses.length === 0) {
        busesList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No buses found matching your criteria.</p>
                <p>Try different dates or routes.</p>
            </div>`;
        return;
    }

    busesList.innerHTML = `
        <div class="buses-grid">
            ${buses.map(bus => `
                <div class="bus-card">
                    <div class="bus-header">
                        <span class="bus-type">${bus.busType}</span>
                        <span class="route-price">₹${bus.price}</span>
                    </div>
                    <div class="bus-route">
                        <div class="route-from">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${bus.from}</span>
                        </div>
                        <div class="route-arrow">
                            <i class="fas fa-arrow-right"></i>
                        </div>
                        <div class="route-to">
                            <i class="fas fa-map-marker"></i>
                            <span>${bus.to}</span>
                        </div>
                    </div>
                    <div class="bus-details">
                        <p><i class="fas fa-clock"></i> Departure: ${bus.departure}</p>
                        <p><i class="fas fa-chair"></i> Available Seats: ${bus.seats}</p>
                        <p><i class="fas fa-bus"></i> Operator: ${bus.operator}</p>
                    </div>
                    <div class="available-dates">
                        <p><i class="fas fa-calendar-check"></i> Available Dates:</p>
                        ${bus.availableDates.map(date => `<span class="date-tag">${formatDate(date)}</span>`).join('')}
                    </div>
                    <div class="button-group">
                        <button class="btn-primary" onclick="showBusDetails(${bus.id})">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                        <button class="btn-secondary" onclick="selectBus(${bus.id})">
                            <i class="fas fa-ticket-alt"></i> Book Now
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

// Select a bus for booking
function selectBus(busId) {
    const bus = allBuses.find(b => b.id === busId);
    if (!bus) return;

    selectedBus = bus;
    document.getElementById('bus-id').value = bus.id;
    
    // Populate available dates in the select element
    const dateSelect = document.getElementById('selected-date');
    dateSelect.innerHTML = '<option value="">Select a date</option>' +
        bus.availableDates.map(date => 
            `<option value="${date}">${formatDate(date)}</option>`
        ).join('');

    // If there's a date selected in the search form, select it in the booking form
    const searchDate = document.getElementById('date').value;
    if (searchDate && bus.availableDates.includes(searchDate)) {
        dateSelect.value = searchDate;
    }
    
    // Show booking section
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('booking-section').classList.remove('hidden');
}

// Show edit booking form
function editBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const bus = allBuses.find(b => b.id === booking.busId);
    if (!bus) return;

    // Populate the booking form with existing data
    document.getElementById('bus-id').value = booking.busId;
    document.getElementById('name').value = booking.name;
    document.getElementById('email').value = booking.email;
    document.getElementById('phone').value = booking.phone;
    document.getElementById('seats').value = booking.seats;

    // Populate available dates
    const dateSelect = document.getElementById('selected-date');
    dateSelect.innerHTML = '<option value="">Select a date</option>' +
        bus.availableDates.map(date => 
            `<option value="${date}" ${date === booking.date ? 'selected' : ''}>${formatDate(date)}</option>`
        ).join('');

    // Show booking section
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('booking-section').classList.remove('hidden');
    document.getElementById('my-bookings-section').classList.add('hidden');

    // Store booking ID for update
    document.getElementById('booking-form').dataset.bookingId = bookingId;
}

// Update booking form submission handler
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookingId = e.target.dataset.bookingId;
    const formData = {
        busId: parseInt(document.getElementById('bus-id').value),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        seats: parseInt(document.getElementById('seats').value),
        date: document.getElementById('selected-date').value
    };

    try {
        const url = bookingId ? `/api/bookings/${bookingId}` : '/api/bookings';
        const method = bookingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to process booking');
        }

        await loadBuses();
        await loadBookings();
        showSuccess(bookingId ? 'Booking updated successfully!' : 'Booking confirmed successfully!');
        showMyBookings();
    } catch (error) {
        console.error('Error processing booking:', error);
        showError(error.message);
    }
});

// Update showMyBookings function to include edit button
function showMyBookings() {
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('booking-section').classList.add('hidden');
    document.getElementById('my-bookings-section').classList.remove('hidden');

    const bookingsList = document.getElementById('my-bookings-list');
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-ticket-alt"></i>
                <p>No bookings found.</p>
                <p>Book your first bus ticket now!</p>
            </div>`;
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => {
        const bus = allBuses.find(b => b.id === booking.busId);
        return `
            <div class="booking-card">
                <h3><i class="fas fa-ticket-alt"></i> Booking #${booking.id}</h3>
                <div class="bus-route">
                    <div class="route-from">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${bus.from}</span>
                    </div>
                    <div class="route-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="route-to">
                        <i class="fas fa-map-marker"></i>
                        <span>${bus.to}</span>
                    </div>
                </div>
                <p><i class="fas fa-user"></i> Passenger: ${booking.name}</p>
                <p><i class="fas fa-calendar"></i> Date: ${formatDate(booking.date)}</p>
                <p><i class="fas fa-chair"></i> Seats: ${booking.seats}</p>
                <p><i class="fas fa-clock"></i> Booked on: ${formatDateTime(booking.timestamp)}</p>
                <div class="button-group">
                    <button class="btn-primary" onclick="editBooking('${booking.id}')">
                        <i class="fas fa-edit"></i> Edit Booking
                    </button>
                    <button class="btn-secondary" onclick="cancelBooking('${booking.id}')">
                        <i class="fas fa-times"></i> Cancel Booking
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel booking');
        }

        await loadBuses(); // Reload buses to update availability
        await loadBookings(); // Reload bookings
        showSuccess('Booking cancelled successfully!');
        showMyBookings();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError(error.message);
    }
}

// Helper functions
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(message) {
    alert(message); // Replace with a better error notification system
}

function showSuccess(message) {
    alert(message); // Replace with a better success notification system
}

// Navigation functions
function backToSearch() {
    document.getElementById('search-section').classList.remove('hidden');
    document.getElementById('booking-section').classList.add('hidden');
    document.getElementById('my-bookings-section').classList.add('hidden');
    displayAllBuses();
}

function showBookingForm() {
    if (!selectedBus) {
        showError('Please select a bus first');
        return;
    }
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('booking-section').classList.remove('hidden');
    document.getElementById('my-bookings-section').classList.add('hidden');
} 