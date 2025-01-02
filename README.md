# Civic Engagement Map - Community Political Engagement Tool

A data visualization tool designed to help engage minority populations for political participation and resource allocation. Live demo: [https://civic-engagement-map.onrender.com/](https://civic-engagement-map.onrender.com/)

## Overview

This project, developed as of January 2nd, 2025, aims to provide a dynamic heatmap visualization of community engagement data, focusing on metrics like voter registration, immigration status, and political participation. The tool is designed to help identify underserved communities and facilitate better resource allocation for political engagement initiatives.

## Technology Stack

### Frontend
- React 18.x with TypeScript
- Vite for build tooling and development
- Leaflet.js with react-leaflet for mapping
- leaflet.heat for heatmap visualization
- Axios for API communications

### Backend
- PostgreSQL 16 for data storage
- OpenAI integration ready for future NLP capabilities
- Node.js/Express API endpoints

## Features

- Interactive heatmap visualization of engagement data
- Adjustable visualization controls:
  - Heat density control
  - Heat spread control
- Placeholder UI for future AI-powered query interface
- Real-time data updates
- Geospatial data rendering

## Future Enhancements

- Natural Language Processing integration via OpenAI for intuitive data querying
- Multiple demographic layer toggles
- Advanced filtering capabilities
- Community engagement metrics
- Resource allocation suggestions

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
```bash
VITE_API_URL=your_api_url
VITE_OPENAI_KEY=your_openai_key
VITE_PG_CONNECTION=your_postgres_connection_string
```
4. Start the development server:
```bash
npm run dev
```
## Database Schema
- The PostgreSQL 16 database is structured to handle:

## Demographic data
- Engagement metrics
- Geospatial information
- Historical participation data

## API Integration
- The application is set up with:

## REST endpoints for data retrieval
- OpenAI integration endpoints (placeholder for future implementation)
- Real-time data updating capabilities

## Contributing
This project is currently in development. The user interface components are placeholders for future implementation. 