# eDNA Analysis Platform

An AI-driven web application for deep-sea environmental DNA (eDNA) analysis.

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Run the application**:
   ```bash
   npm run dev
   ```

This starts both the React app (port 3000) and JSON Server API (port 3001).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@cmlre.gov.in | admin123 |
| Researcher | researcher@cmlre.gov.in | researcher123 |
| Technician | tech@cmlre.gov.in | tech123 |

## Features

- Role-based access control (Administrator, Researcher, Technician)
- Project management and collaboration
- eDNA data upload with metadata
- AI-powered sequence analysis
- Interactive results visualization with charts
- Biodiversity metrics (Shannon, Simpson, Chao1)
- Novel taxa discovery
- Model management (Admin only)
- User management (Admin only)

## Technology Stack

- React 19.2.0
- React Router DOM 7.9.3
- Recharts 3.2.1 (Data Visualization)
- Axios 1.12.2 (HTTP Client)
- JSON Server (Mock Backend)
- React Icons

## Access the Application

After running 
pm run dev:
- Frontend: http://localhost:3000
- API: http://localhost:3001

Login with any of the demo credentials above to explore!
