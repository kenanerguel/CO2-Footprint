# CO2-Footprint Webseite

**Repository**: [GitHub Link hier einfügen]

## Projektübersicht

Webseite für CO2-Emissionsdaten von Unternehmen und Ländern.

### Zielsetzung
- CO2-Emissionsdaten darstellen
- Datenvisualisierung
- Responsive Webanwendung
- Sicherheit und Barrierefreiheit

## Inhaltsverzeichnis

- [1. Konzeption](01-konzeption.md)
- [2. Technische Architektur](02-architektur.md)
- [3. Design System](03-design.md)
- [4. Implementierung](04-implementierung.md)
- [5. Sicherheitskonzept](05-sicherheit.md)
- [6. Testing & Quality](06-testing.md)
- [7. Probleme & Lösungen](07-probleme.md)
- [8. Reflexion](08-reflexion.md)

## Schnellstart

### Lokale Entwicklung
```bash
npm install
npm run dev
```

### Deployment
```bash
npm run build
npm run deploy
```

## Technologie-Stack

- **Frontend**: HTML5 + Bootstrap 5 + Vanilla JavaScript
- **Testing**: Mocha + Chai
- **Development**: Live-Server
- **Code Quality**: ESLint
- **Deployment**: GitHub Pages

## Erfüllte Anforderungen

- Öffentliches GitHub Repository  
- Modernes CSS/JS Framework (Bootstrap 5 + Vanilla JS)  
- Titel und Logo  
- Header mit globaler Navigation  
- Content-Bereich und Footer  
- Lokales Menü mit RTL/LTR Support (`dir="rtl"`)  
- Responsive Design (Bootstrap Grid)  
- CO2-Daten Tabelle mit Filter/Sort  
- Input-Validierung und XSS-Schutz (`textContent`)  

## Projektstruktur

```
├── docs/                    # Dokumentation
├── src/
│   ├── components/         # React Components
│   ├── data/              # CO2 Beispieldaten
│   ├── hooks/             # Custom Hooks
│   ├── styles/            # CSS/Tailwind
│   └── utils/             # Hilfsfunktionen
├── public/                 # Statische Assets
├── tests/                  # Test-Dateien
└── README.md
``` 