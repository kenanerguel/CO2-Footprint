/**
 * Erweiterte Filter-Funktionen für CO2-Daten
 * Sichere Implementierung mit Input Validation
 */

const FilterManager = {
    
    // Filter-System initialisieren
    init() {
        this.setupAdvancedFilters();
        this.setupFilterClearButtons();
        console.log('Filter-Manager initialisiert');
    },
    
    // Erweiterte Filter einrichten
    setupAdvancedFilters() {
        // Jahr-Range Filter
        this.createYearRangeFilter();
        
        // Emissions-Range Filter  
        this.createEmissionsRangeFilter();
        
        // Sektor Multi-Select
        this.createSectorMultiSelect();
        
        // Quick Filter Buttons
        this.createQuickFilters();
    },
    
    // Jahr-Range Filter erstellen
    createYearRangeFilter() {
        const filterContainer = document.querySelector('.row.mb-4');
        
        const yearFilterHTML = `
            <div class="col-md-6 mt-2">
                <label for="yearRange" class="form-label">Jahr-Bereich</label>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm" id="yearFrom">
                        <option value="">Von Jahr</option>
                    </select>
                    <select class="form-select form-select-sm" id="yearTo">
                        <option value="">Bis Jahr</option>
                    </select>
                </div>
            </div>
        `;
        
        filterContainer.insertAdjacentHTML('beforeend', yearFilterHTML);
        
        // Event Listeners
        document.getElementById('yearFrom').addEventListener('change', () => {
            this.validateDateRange();
            CO2App.applyFilters();
        });
        
        document.getElementById('yearTo').addEventListener('change', () => {
            this.validateDateRange();
            CO2App.applyFilters();
        });
    },
    
    // Emissions-Range Filter erstellen
    createEmissionsRangeFilter() {
        const filterContainer = document.querySelector('.row.mb-4');
        
        const emissionsFilterHTML = `
            <div class="col-md-6 mt-2">
                <label for="emissionsRange" class="form-label">CO2-Emissionen (Millionen Tonnen)</label>
                <div class="d-flex gap-2">
                    <input type="number" class="form-control form-control-sm" 
                           id="emissionsMin" placeholder="Min" min="0" step="0.1">
                    <input type="number" class="form-control form-control-sm" 
                           id="emissionsMax" placeholder="Max" min="0" step="0.1">
                </div>
            </div>
        `;
        
        filterContainer.insertAdjacentHTML('beforeend', emissionsFilterHTML);
        
        // Event Listeners mit Debouncing
        let emissionsTimeout;
        
        ['emissionsMin', 'emissionsMax'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                // Input Sanitization
                this.sanitizeNumberInput(e.target);
                
                clearTimeout(emissionsTimeout);
                emissionsTimeout = setTimeout(() => {
                    CO2App.applyFilters();
                }, 500);
            });
        });
    },
    
    // Sektor Multi-Select erstellen
    createSectorMultiSelect() {
        const filterContainer = document.querySelector('.row.mb-4');
        
        const sectorFilterHTML = `
            <div class="col-md-12 mt-3">
                <label class="form-label">Sektoren</label>
                <div class="d-flex flex-wrap gap-2" id="sectorFilters">
                    <!-- Wird dynamisch gefüllt -->
                </div>
            </div>
        `;
        
        filterContainer.insertAdjacentHTML('beforeend', sectorFilterHTML);
    },
    
    // Quick Filter Buttons erstellen
    createQuickFilters() {
        const dataSection = document.getElementById('data');
        const quickFiltersHTML = `
            <div class="row mb-3" id="quickFiltersRow">
                <div class="col-12">
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-outline-success btn-sm" id="topEmittersBtn">
                            Top 10 Emittenten
                        </button>
                        <button class="btn btn-outline-success btn-sm" id="companiesOnlyBtn">
                            Nur Unternehmen
                        </button>
                        <button class="btn btn-outline-success btn-sm" id="countriesOnlyBtn">
                            Nur Länder
                        </button>
                        <button class="btn btn-outline-success btn-sm" id="recentDataBtn">
                            Aktuelle Daten (2023)
                        </button>
                        <button class="btn btn-outline-danger btn-sm" id="clearAllBtn">
                            Alle Filter zurücksetzen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const filterRow = dataSection.querySelector('.row.mb-4');
        if (filterRow && !document.getElementById('quickFiltersRow')) {
            filterRow.insertAdjacentHTML('afterend', quickFiltersHTML);
            
            // Event Listeners hinzufügen
            this.attachQuickFilterListeners();
        }
    },
    
    // Event Listeners für Quick-Filter Buttons
    attachQuickFilterListeners() {
        const buttons = [
            { id: 'topEmittersBtn', filter: 'top-emitters' },
            { id: 'companiesOnlyBtn', filter: 'companies-only' },
            { id: 'countriesOnlyBtn', filter: 'countries-only' },
            { id: 'recentDataBtn', filter: 'recent' },
            { id: 'clearAllBtn', filter: 'clear' }
        ];
        
        buttons.forEach(({ id, filter }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`Button geklickt: ${filter}`);
                    
                    if (filter === 'clear') {
                        this.clearAllFilters();
                        CO2App.applyFilters();
                    } else {
                        this.applyQuickFilter(filter);
                    }
                });
            }
        });
        
        console.log('Quick-Filter Event Listeners hinzugefügt');
    },
    
    // Filter Clear Buttons einrichten
    setupFilterClearButtons() {
        // Individual clear buttons für jeden Filter
        document.querySelectorAll('.form-select, .form-control').forEach(input => {
            if (input.id.includes('Filter') || input.id.includes('search') || 
                input.id.includes('Min') || input.id.includes('Max')) {
                
                this.addClearButton(input);
            }
        });
    },
    
    // Clear Button zu Input hinzufügen
    addClearButton(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'position-relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '×';
        clearBtn.className = 'btn btn-sm position-absolute end-0 top-50 translate-middle-y border-0';
        clearBtn.style.zIndex = '10';
        clearBtn.style.background = 'transparent';
        clearBtn.title = 'Filter löschen';
        
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            input.value = '';
            CO2App.applyFilters();
        });
        
        wrapper.appendChild(clearBtn);
    },
    
    // Quick Filter anwenden
    applyQuickFilter(filterType) {
        // Erst alle Filter zurücksetzen
        this.clearAllFilters();
        
        switch (filterType) {
            case 'top-emitters':
                this.showTopEmitters();
                break;
            case 'companies-only':
                this.showCompaniesOnly();
                break;
            case 'countries-only':
                this.showCountriesOnly();
                break;
            case 'recent':
                this.showRecentData();
                break;
        }
        
        // Filter anwenden nach dem Setzen
        CO2App.applyFilters();
        console.log(`Quick Filter angewendet: ${filterType}`);
    },
    
    // Top 10 Emittenten anzeigen
    showTopEmitters() {
        // Setze einen speziellen Filter-Flag
        this.quickFilterActive = 'top-emitters';
    },
    
    // Nur Unternehmen anzeigen
    showCompaniesOnly() {
        // Setze den Company-Filter auf "nur Unternehmen"
        this.quickFilterActive = 'companies-only';
    },
    
    // Nur Länder anzeigen
    showCountriesOnly() {
        // Setze den Company-Filter auf "nur Länder"
        this.quickFilterActive = 'countries-only';
    },
    
    // Aktuelle Daten (2023) anzeigen
    showRecentData() {
        const yearFromSelect = document.getElementById('yearFrom');
        const yearToSelect = document.getElementById('yearTo');
        
        if (yearFromSelect && yearToSelect) {
            yearFromSelect.value = '2023';
            yearToSelect.value = '2023';
        }
    },
    
    // Alle Filter zurücksetzen
    clearAllFilters() {
        // Quick-Filter deaktivieren
        this.quickFilterActive = null;
        
        // Input Felder leeren
        document.querySelectorAll('#countryFilter, #companyFilter, #searchInput, #yearFrom, #yearTo, #emissionsMin, #emissionsMax').forEach(input => {
            if (input) input.value = '';
        });
        
        // Sektor-Filter zurücksetzen
        document.querySelectorAll('#sectorFilters .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Sortierung zurücksetzen
        if (typeof TableSort !== 'undefined') {
            TableSort.resetSort();
        }
        
        console.log('Alle Filter zurückgesetzt');
    },
    
    // Filter für CO2App erweitern
    extendCO2AppFilters() {
        const originalApplyFilters = CO2App.applyFilters;
        
        CO2App.applyFilters = function() {
            const countryFilter = document.getElementById('countryFilter').value;
            const companyFilter = document.getElementById('companyFilter').value;
            const searchTerm = this.sanitizeInput(document.getElementById('searchInput').value);
            
            // Erweiterte Filter
            const yearFrom = parseInt(document.getElementById('yearFrom')?.value) || null;
            const yearTo = parseInt(document.getElementById('yearTo')?.value) || null;
            const emissionsMin = parseFloat(document.getElementById('emissionsMin')?.value) * 1000000 || null;
            const emissionsMax = parseFloat(document.getElementById('emissionsMax')?.value) * 1000000 || null;
            
            // Aktive Sektor-Filter ermitteln
            const activeSectors = Array.from(document.querySelectorAll('#sectorFilters .btn.active'))
                .map(btn => btn.dataset.sector);
            
            let filtered = this.data.filter(item => {
                // Basis Filter
                const matchesCountry = !countryFilter || item.country === countryFilter;
                const matchesCompany = !companyFilter || item.company === companyFilter;
                const matchesSearch = !searchTerm || 
                    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    item.sector.toLowerCase().includes(searchTerm.toLowerCase());
                
                // Erweiterte Filter
                const matchesYearFrom = !yearFrom || item.year >= yearFrom;
                const matchesYearTo = !yearTo || item.year <= yearTo;
                const matchesEmissionsMin = !emissionsMin || item.emissions >= emissionsMin;
                const matchesEmissionsMax = !emissionsMax || item.emissions <= emissionsMax;
                
                // Sektor-Filter
                const matchesSector = activeSectors.length === 0 || activeSectors.includes(item.sector);
                
                return matchesCountry && matchesCompany && matchesSearch && 
                       matchesYearFrom && matchesYearTo && 
                       matchesEmissionsMin && matchesEmissionsMax && matchesSector;
            });
            
            // Quick-Filter anwenden
            if (FilterManager.quickFilterActive) {
                switch (FilterManager.quickFilterActive) {
                    case 'top-emitters':
                        filtered = filtered
                            .sort((a, b) => b.emissions - a.emissions)
                            .slice(0, 10);
                        break;
                    case 'companies-only':
                        filtered = filtered.filter(item => item.company !== null);
                        break;
                    case 'countries-only':
                        filtered = filtered.filter(item => item.company === null);
                        break;
                }
            }
            
            this.filteredData = filtered;
            
            this.renderTable();
            console.log(`Erweiterte Filter: ${this.filteredData.length} von ${this.data.length} Einträgen`);
        };
    },
    
    // Datum-Range Validierung
    validateDateRange() {
        const yearFrom = document.getElementById('yearFrom');
        const yearTo = document.getElementById('yearTo');
        
        if (yearFrom.value && yearTo.value) {
            if (parseInt(yearFrom.value) > parseInt(yearTo.value)) {
                yearTo.setCustomValidity('Das Ende-Jahr muss nach dem Start-Jahr liegen');
                yearTo.reportValidity();
                return false;
            } else {
                yearTo.setCustomValidity('');
            }
        }
        return true;
    },
    
    // Number Input Sanitization
    sanitizeNumberInput(input) {
        let value = input.value;
        
        // Nur Zahlen und Punkte erlauben
        value = value.replace(/[^0-9.]/g, '');
        
        // Maximal ein Punkt
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Maximal 2 Dezimalstellen
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        input.value = value;
    },
    
    // Sektor-Filter populieren
    populateSectorFilters() {
        if (!CO2App.data) return;
        
        const sectors = [...new Set(CO2App.data.map(item => item.sector))].sort();
        const container = document.getElementById('sectorFilters');
        
        container.innerHTML = sectors.map(sector => `
            <button class="btn btn-outline-secondary btn-sm sector-filter" 
                    data-sector="${this.escapeHtml(sector)}">
                ${this.escapeHtml(sector)}
            </button>
        `).join('');
        
        // Event Listeners für Sektor-Buttons hinzufügen
        container.querySelectorAll('.sector-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sector = button.dataset.sector;
                console.log(`Sektor-Button geklickt: ${sector}`);
                this.toggleSectorFilter(sector);
            });
        });
    },
    
    // Sektor-Filter umschalten
    toggleSectorFilter(sector) {
        const button = document.querySelector(`[data-sector="${sector}"]`);
        if (button) {
            button.classList.toggle('active');
            
            // Visuelle Anpassung
            if (button.classList.contains('active')) {
                button.classList.remove('btn-outline-secondary');
                button.classList.add('btn-success');
            } else {
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-secondary');
            }
            
            console.log(`Sektor-Filter ${sector} ${button.classList.contains('active') ? 'aktiviert' : 'deaktiviert'}`);
            CO2App.applyFilters();
        } else {
            console.error(`Sektor-Button nicht gefunden: ${sector}`);
        }
    },
    
    // HTML escaping für Sicherheit
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// FilterManager initialisieren und CO2App erweitern
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM geladen, warte auf CO2App...');
    
    setTimeout(() => {
        console.log('FilterManager wird initialisiert...');
        FilterManager.init();
        FilterManager.extendCO2AppFilters();
        
        // Jahr-Optionen populieren
        const years = [...new Set(CO2App.data?.map(item => item.year) || [2022, 2023])].sort();
        ['yearFrom', 'yearTo'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    select.appendChild(option);
                });
                console.log(`Jahr-Optionen für ${id} hinzugefügt: ${years.join(', ')}`);
            }
        });
        
        // Sektor-Filter populieren
        FilterManager.populateSectorFilters();
        
        console.log('FilterManager vollständig initialisiert');
    }, 500); // Längere Wartezeit für sicherere Initialisierung
});

// Export für Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
} 