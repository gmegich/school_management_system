# Frontend Application Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the API URL if your backend is running on a different port:
     - `VITE_API_URL`: Backend API URL (default: http://localhost:5000)
     - `VITE_SOCKET_URL`: Socket.IO server URL (default: http://localhost:5000)

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:3001`

## Features

- **Authentication**: Login and registration
- **Role-based Dashboards**: Different views for Admin, Driver, and Parent
- **Real-time GPS Tracking**: Live bus location updates using Socket.IO
- **Interactive Maps**: Leaflet.js integration for map visualization
- **Responsive Design**: Mobile-friendly interface

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Troubleshooting

- **Port already in use**: Change the port in `vite.config.js`
- **API connection errors**: Verify `VITE_API_URL` in `.env` matches your backend URL
- **Map not loading**: Check that Leaflet CSS is loaded (should be in `index.html`)

