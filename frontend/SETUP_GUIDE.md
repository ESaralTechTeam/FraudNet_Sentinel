# Frontend Setup Guide

## Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## New Dependencies

The following packages have been added:

```json
{
  "lucide-react": "^0.294.0",  // Modern icon library
  "tailwindcss": "^3.4.0",     // Utility-first CSS
  "autoprefixer": "^10.4.16",  // PostCSS plugin
  "postcss": "^8.4.32"         // CSS processor
}
```

### Install New Dependencies

```bash
npm install lucide-react@^0.294.0
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.js                    # Main dashboard
│   │   ├── Alerts.js                       # Alert management
│   │   ├── Analytics.js                    # Advanced analytics
│   │   ├── Beneficiaries.js                # Beneficiary list
│   │   ├── ComplaintForm.js                # Submit complaints
│   │   ├── ComplaintsInvestigation.js      # NEW: Investigation interface
│   │   └── FraudNetworks.js                # Network visualization
│   ├── api.js                              # API service layer
│   ├── App.js                              # Main app with routing
│   ├── index.js                            # Entry point
│   └── index.css                           # Global styles
├── tailwind.config.js                      # Tailwind configuration
├── postcss.config.js                       # PostCSS configuration
├── package.json                            # Dependencies
├── README.md                               # Main documentation
├── COMPLAINTS_INVESTIGATION.md             # Investigation feature docs
└── SETUP_GUIDE.md                          # This file
```

## Configuration Files

### tailwind.config.js
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#003d82',
          darkblue: '#002855',
          orange: '#ff6b35',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        }
      }
    }
  }
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## API Configuration

Update `src/api.js` with your backend URL:

```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
// For production:
// const API_BASE_URL = process.env.REACT_APP_API_URL;
```

## Environment Variables

Create `.env` file in frontend root:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

For production:
```env
REACT_APP_API_URL=https://your-api-gateway-url/prod/api/v1
REACT_APP_ENV=production
```

## Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main dashboard with stats |
| `/alerts` | Alerts | Alert management |
| `/beneficiaries` | Beneficiaries | Beneficiary list |
| `/fraud-networks` | FraudNetworks | Network visualization |
| `/analytics` | Analytics | Advanced analytics |
| `/complaints-investigation` | ComplaintsInvestigation | NEW: Investigation interface |
| `/complaint` | ComplaintForm | Submit new complaint |

## Features by Component

### Dashboard
- Statistics cards
- Financial overview
- Charts (pie, line)
- Recent complaints
- High-risk alerts

### Alerts
- Filter by severity
- Search functionality
- Alert cards
- Stats overview

### Analytics
- District risk analysis
- Detection trends
- Risk distribution
- Data tables

### Complaints Investigation (NEW)
- Complaints table
- Audio playback
- Transcript viewing
- Fraud score filtering
- Status management
- Pagination
- Search

## Development Workflow

### 1. Start Backend
```bash
cd backend
python app.py
# Backend runs on http://localhost:8000
```

### 2. Start Frontend
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

### 3. Make Changes
- Edit components in `src/components/`
- Hot reload is enabled
- Changes appear immediately

### 4. Build for Production
```bash
npm run build
# Creates optimized build in build/
```

## Styling Guide

### Using Tailwind Classes
```javascript
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <p className="text-sm text-gray-600">Description</p>
</div>
```

### Government Color Palette
```javascript
// Primary
bg-gov-blue text-white

// Dark
bg-gov-darkblue text-white

// Status Colors
bg-red-600    // Critical
bg-orange-500 // Warning
bg-green-500  // Success
bg-blue-500   // Info
```

### Common Patterns
```javascript
// Card
className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"

// Button Primary
className="px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-gov-darkblue"

// Button Secondary
className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"

// Badge
className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"

// Input
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue"
```

## Icons (Lucide React)

```javascript
import { 
  AlertTriangle, Users, BarChart3, 
  Play, Pause, FileText, Download 
} from 'lucide-react';

<AlertTriangle className="h-5 w-5 text-red-600" />
```

## Common Issues

### Issue: Tailwind classes not working
**Solution**: Ensure `tailwind.config.js` and `postcss.config.js` exist in root

### Issue: Icons not showing
**Solution**: Install lucide-react
```bash
npm install lucide-react
```

### Issue: API connection failed
**Solution**: 
1. Check backend is running
2. Verify CORS settings
3. Check API_BASE_URL in api.js

### Issue: Build errors
**Solution**: Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Deployment

### Build
```bash
npm run build
```

### Deploy to S3
```bash
aws s3 sync build/ s3://your-bucket-name --delete
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Performance Tips

1. **Code Splitting**: Use React.lazy() for large components
2. **Memoization**: Use React.memo() for expensive renders
3. **Debouncing**: Debounce search inputs
4. **Pagination**: Limit rendered items
5. **Image Optimization**: Use WebP format
6. **Bundle Analysis**: Run `npm run build -- --stats`

## Browser DevTools

### React DevTools
Install React DevTools extension for debugging

### Redux DevTools
If using Redux, install Redux DevTools

### Lighthouse
Run Lighthouse audit for performance insights

## Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Contact development team

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure API URL
3. ✅ Start development server
4. ✅ Test all routes
5. ✅ Review components
6. ✅ Customize styling
7. ✅ Deploy to production

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Recharts](https://recharts.org)
- [React Router](https://reactrouter.com)

---

© 2026 Economic Leakage Detection Platform
