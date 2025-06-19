/**
 * CO2-Footprint Hauptanwendung
 * Vanilla JavaScript Implementation
 */

// Globales App Objekt
const CO2App = {
    data: [],
    filteredData: [],
    currentSort: { field: null, direction: 'asc' },
    
    // Initialisierung der Anwendung
    init() {
        this.setupEventListeners();
        this.initializeDirectionSupport();
        this.loadCO2Data();
        this.setupSmoothScrolling();
        this.setupNavigation();
    },
    
    // Event Listeners für die gesamte App
    setupEventListeners() {
        document.getElementById('countryFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('companyFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.applyFilters();
            }, 300);
        });
        
        this.setupNavigation();
    },
    
    // Navigation Active States
    setupNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        });
    },
    
    // Smooth Scrolling für interne Links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },
    
    // RTL/LTR Direction Support initialisieren
    initializeDirectionSupport() {
        const userLanguage = navigator.language || navigator.userLanguage;
        const rtlLanguages = ['ar', 'he', 'ur', 'fa', 'ps', 'sd'];
        
        const isRTL = rtlLanguages.some(lang => userLanguage.startsWith(lang));
        if (isRTL) {
            setDirection('rtl');
        }
    },
    
    // CO2-Daten von JSON-Datei laden
    async loadCO2Data() {
        try {
            this.showLoading(true);
            
            const response = await fetch('data/co2-data.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data = await response.json();
            this.filteredData = [...this.data];
            
            this.populateFilterOptions();
            this.renderTable();
            
        } catch (error) {
            console.error('Fehler beim Laden der CO2-Daten:', error);
            this.showError('Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Filter-Dropdown Optionen füllen
    populateFilterOptions() {
        const countries = [...new Set(this.data.map(item => item.country))].sort();
        const companies = [...new Set(this.data.map(item => item.company).filter(Boolean))].sort();
        
        const countrySelect = document.getElementById('countryFilter');
        const companySelect = document.getElementById('companyFilter');
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companySelect.appendChild(option);
        });
    },
    
    // Filter anwenden
    applyFilters() {
        const countryFilter = document.getElementById('countryFilter').value;
        const companyFilter = document.getElementById('companyFilter').value;
        const searchTerm = this.sanitizeInput(document.getElementById('searchInput').value);
        
        this.filteredData = this.data.filter(item => {
            const matchesCountry = !countryFilter || item.country === countryFilter;
            const matchesCompany = !companyFilter || item.company === companyFilter;
            const matchesSearch = !searchTerm || 
                item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.sector.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesCountry && matchesCompany && matchesSearch;
        });
        
        this.renderTable();
    },
    
    // Tabelle rendern
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        Keine Daten gefunden. Bitte passen Sie Ihre Filter an.
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = this.filteredData.map(item => `
            <tr class="filter-fade">
                <td>${this.escapeHtml(item.country)}</td>
                <td>${item.company ? this.escapeHtml(item.company) : '<span class="text-muted">—</span>'}</td>
                <td>${this.formatNumber(item.emissions)}</td>
                <td>${item.year}</td>
                <td>
                    <span class="badge bg-secondary">${this.escapeHtml(item.sector)}</span>
                </td>
            </tr>
        `).join('');
    },
    
    // Loading State anzeigen/verstecken
    showLoading(isLoading) {
        const tableBody = document.getElementById('tableBody');
        const table = document.getElementById('co2Table');
        
        if (isLoading) {
            table.classList.add('loading');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Lade Daten...</span>
                        </div>
                        <div class="mt-2">Lade CO2-Daten...</div>
                    </td>
                </tr>
            `;
        } else {
            table.classList.remove('loading');
        }
    },
    
    // Fehler anzeigen
    showError(message) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle"></i>
                        ${this.escapeHtml(message)}
                    </div>
                </td>
            </tr>
        `;
    },
    
    // Zahl formatieren (mit Tausender-Trenner)
    formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    },
    
    // XSS-Schutz: HTML escapen
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Input Sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/[<>\"'&]/g, '')
            .trim()
            .substring(0, 100);
    }
};

// RTL/LTR Direction Toggle (Globale Funktion)
function setDirection(direction) {
    const html = document.documentElement;
    const currentDir = html.getAttribute('dir');
    
    if (currentDir !== direction) {
        html.setAttribute('dir', direction);
        html.setAttribute('lang', direction === 'rtl' ? 'ar' : 'de');
        
        const brandText = document.querySelector('.navbar-brand span');
        if (direction === 'rtl') {
            brandText.textContent = 'بصمة الكربون';
        } else {
            brandText.textContent = 'CO2-Footprint';
        }
    }
}

// App initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    CO2App.init();
});

// Service Worker für Offline-Unterstützung (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registriert:', registration);
            })
            .catch(error => {
                console.log('SW Registrierung fehlgeschlagen:', error);
            });
    });
} 