# Bus Booking Website

A simple bus booking website built with HTML, CSS, JavaScript, and Express.js that stores data in text files.

## Features

- Search for available buses
- Book bus tickets
- View booking history
- Responsive design
- Data persistence using text files

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone this repository or download the files
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your web browser and visit:
   ```
   http://localhost:3000
   ```

## Project Structure

- `public/` - Contains frontend files
  - `index.html` - Main HTML file
  - `styles.css` - CSS styles
  - `script.js` - Client-side JavaScript
- `data/` - Contains data files
  - `buses.txt` - Stores bus information
  - `bookings.txt` - Stores booking information
- `server.js` - Express server implementation
- `package.json` - Project configuration and dependencies

## Usage

1. Search for buses by entering departure and destination cities
2. Click on a bus to select it for booking
3. Fill in your details and confirm the booking
4. View your booking history using the "My Bookings" button

## Data Storage

The application uses text files to store data:
- Bus information is stored in `data/buses.txt`
- Booking information is stored in `data/bookings.txt`

Both files use JSON format for data storage. 