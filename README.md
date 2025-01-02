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