# 2. Technische Architektur

## 2.1 System-Architektur Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Static Hosting│    │   Data Source   │
│                 │◄──►│   (GitHub Pages)│◄──►│   (JSON Files)  │
│ HTML5+Bootstrap │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2.2 Frontend-Architektur

### Datei-Struktur
```
├── index.html              # Hauptseite
├── css/
│   ├── bootstrap.min.css   # Bootstrap 5 Framework
│   └── custom.css          # Custom Styles
├── js/
│   ├── main.js            # Hauptlogik
│   ├── table-sort.js      # Tabellen-Sortierung
│   └── filters.js         # Filter-Funktionen
├── data/
│   └── co2-data.json      # CO2 Emissionsdaten
└── assets/
    ├── logo.png           # Logo
    └── favicon.ico        # Favicon
```

### JavaScript Module
```javascript
// main.js - CO2App Hauptlogik
const CO2App = {
  data: [],
  filteredData: [],
  currentSort: { field: null, direction: 'asc' },
  
  // XSS-Schutz implementiert
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text; // Sicher!
    return div.innerHTML;
  },
  
  // Input Sanitization
  sanitizeInput(input) {
    return input.replace(/[<>\"'&]/g, '').trim().substring(0, 100);
  }
};

// table-sort.js - Tabellen-Sortierung mit Accessibility
const TableSort = {
  // ARIA-Labels, Keyboard Navigation
  // Numerische vs. String-Sortierung
};

// filters.js - Erweiterte Filter-Funktionen  
const FilterManager = {
  // Jahr-Range, Emissions-Range
  // Quick-Filter (Top 10, nur Unternehmen, etc.)
};
```

## 2.3 Datenmodell

### CO2-Datenstruktur
```typescript
interface CO2Data {
  id: string;
  country: string;
  countryCode: string; // ISO Alpha-2
  company?: string;
  sector: Sector;
  emissions: number; // Tonnen CO2
  year: number;
  verified: boolean;
  source: string;
  lastUpdated: Date;
}

enum Sector {
  ENERGY = 'energy',
  TRANSPORT = 'transport',
  INDUSTRY = 'industry',
  AGRICULTURE = 'agriculture',
  BUILDINGS = 'buildings'
}
```

### Sample Data Structure
```json
{
  "countries": [
    {
      "id": "de-2023-001",
      "country": "Deutschland",
      "countryCode": "DE",
      "company": null,
      "sector": "energy",
      "emissions": 675000000,
      "year": 2023,
      "verified": true,
      "source": "Umweltbundesamt"
    }
  ],
  "companies": [
    {
      "id": "volkswagen-2023",
      "country": "Deutschland", 
      "company": "Volkswagen AG",
      "sector": "transport",
      "emissions": 12500000,
      "year": 2023,
      "verified": true,
      "source": "Nachhaltigkeitsbericht"
    }
  ]
}
```

## 2.4 Security Architecture

### Input Validation Layer
```javascript
// XSS Protection - Einfach und effektiv
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Gefährliche Zeichen entfernen
  return input
    .replace(/[<>\"'&]/g, '')
    .trim()
    .substring(0, 100); // Max 100 Zeichen
};

// HTML Rendering - Immer sicher
const renderTableRow = (item) => {
  return `
    <tr>
      <td>${escapeHtml(item.country)}</td>
      <td>${item.company ? escapeHtml(item.company) : '—'}</td>
      <td>${formatNumber(item.emissions)}</td>
    </tr>
  `;
};

// Niemals innerHTML mit User-Input!
// Immer textContent verwenden für Input
```

### Content Security Policy
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com;
```

## 2.5 Performance-Architektur

### Bundle Splitting
```typescript
// Route-based Code Splitting
const Home = lazy(() => import('./pages/Home'));
const DataTable = lazy(() => import('./pages/DataTable'));
const About = lazy(() => import('./pages/About'));
```

### Caching Strategy
- **Static Assets**: Cache-Control: max-age=31536000
- **API Responses**: Cache-Control: max-age=3600
- **Service Worker**: Offline-First für statische Inhalte

### Virtual Scrolling für große Datasets
```typescript
// React-Window für Performance
<FixedSizeList
  height={600}
  itemCount={filteredData.length}
  itemSize={50}
  itemData={filteredData}
>
  {TableRow}
</FixedSizeList>
```

## 2.6 Responsive Architecture

### Breakpoint System
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px'
};

// Mobile-First Media Queries
@media (min-width: 768px) {
  .data-table {
    display: table;
  }
}
```

### Component Adaptions
- **Desktop**: Sidebar + Table Layout
- **Tablet**: Collapsible Sidebar + Table
- **Mobile**: Filter Drawer + Card Layout

## 2.7 Internationalization Architecture

### i18n Structure
```
└── locales/
    ├── de/
    │   ├── common.json
    │   ├── navigation.json
    │   └── data.json
    └── en/
        ├── common.json
        ├── navigation.json
        └── data.json
```

### RTL/LTR Support
```css
[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}

[dir="ltr"] .sidebar {
  left: 0;
  right: auto;
}
```

## 2.8 Build & Deployment Architecture

### Build Pipeline
```yaml
# GitHub Actions
name: Build & Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install & Build
        run: npm ci && npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
```

### Environment Configuration
```typescript
// Environment Variables
interface Config {
  NODE_ENV: 'development' | 'production';
  API_BASE_URL: string;
  ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
}
```

## 2.9 Testing & Deployment Status

- **Live-Server**: ✅ Implementiert (Port 3000) - läuft erfolgreich
- **Manual Testing**: ✅ Abgeschlossen - Test-Checklist erstellt  
- **GitHub Repository**: ✅ Öffentlich verfügbar
- **Browser Testing**: ✅ Chrome/Firefox/Safari getestet
- **Responsive Testing**: ✅ Mobile/Tablet/Desktop vollständig
- **RTL/LTR Support**: ✅ Vollständig implementiert und getestet
- **XSS-Schutz**: ✅ textContent + Input-Sanitization implementiert
- **Accessibility**: ✅ ARIA-Labels und Keyboard Navigation
- **Performance**: ✅ Schnelle Ladezeiten unter 30 Datensätzen 