/**
 * Tabellen-Sortierung für CO2-Daten
 * Sicher implementiert mit XSS-Schutz
 */

const TableSort = {
    
    // Sortierung initialisieren
    init() {
        this.setupSortableHeaders();
        console.log('Tabellen-Sortierung initialisiert');
    },
    
    // Klickbare Header einrichten
    setupSortableHeaders() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                this.handleSort(e.target);
            });
            
            // Keyboard Accessibility
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleSort(e.target);
                }
            });
            
            // ARIA Attributes für Accessibility
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-label', `Sortieren nach ${header.textContent.trim()}`);
        });
    },
    
    // Sort Event Handler
    handleSort(headerElement) {
        const sortField = headerElement.getAttribute('data-sort');
        if (!sortField) return;
        
        // Aktuelle Sortier-Richtung ermitteln
        const currentDirection = headerElement.getAttribute('data-direction') || 'none';
        let newDirection;
        
        switch (currentDirection) {
            case 'none':
            case 'desc':
                newDirection = 'asc';
                break;
            case 'asc':
                newDirection = 'desc';
                break;
        }
        
        // Alle anderen Header zurücksetzen
        document.querySelectorAll('.sortable').forEach(header => {
            header.removeAttribute('data-direction');
            header.setAttribute('aria-sort', 'none');
        });
        
        // Neuen Header markieren
        headerElement.setAttribute('data-direction', newDirection);
        headerElement.setAttribute('aria-sort', newDirection);
        
        // CO2App sortieren lassen
        this.sortData(sortField, newDirection);
        
        console.log(`Sortiert nach ${sortField}: ${newDirection}`);
    },
    
    // Daten sortieren
    sortData(field, direction) {
        if (!CO2App.filteredData) return;
        
        CO2App.filteredData.sort((a, b) => {
            let valueA = this.getSortValue(a, field);
            let valueB = this.getSortValue(b, field);
            
            // Numerische Sortierung
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return direction === 'asc' ? valueA - valueB : valueB - valueA;
            }
            
            // String Sortierung (case-insensitive)
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
            
            if (direction === 'asc') {
                return valueA.localeCompare(valueB, 'de', { numeric: true });
            } else {
                return valueB.localeCompare(valueA, 'de', { numeric: true });
            }
        });
        
        // App-State aktualisieren
        CO2App.currentSort = { field, direction };
        
        // Tabelle neu rendern
        CO2App.renderTable();
    },
    
    // Wert für Sortierung extrahieren
    getSortValue(item, field) {
        switch (field) {
            case 'country':
                return item.country || '';
            case 'company':
                return item.company || 'ZZZ'; // Null-Werte ans Ende
            case 'emissions':
                return parseFloat(item.emissions) || 0;
            case 'year':
                return parseInt(item.year) || 0;
            case 'sector':
                return item.sector || '';
            default:
                return '';
        }
    },
    
    // Sortierung zurücksetzen
    resetSort() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.removeAttribute('data-direction');
            header.setAttribute('aria-sort', 'none');
        });
        
        CO2App.currentSort = { field: null, direction: 'asc' };
        CO2App.filteredData = [...CO2App.data];
        CO2App.renderTable();
        
        console.log('Sortierung zurückgesetzt');
    },
    
    // Sortierung wiederherstellen (nach Filter-Änderung)
    reapplySort() {
        if (CO2App.currentSort.field) {
            this.sortData(CO2App.currentSort.field, CO2App.currentSort.direction);
            
            // Visual State wiederherstellen
            const header = document.querySelector(`[data-sort="${CO2App.currentSort.field}"]`);
            if (header) {
                header.setAttribute('data-direction', CO2App.currentSort.direction);
                header.setAttribute('aria-sort', CO2App.currentSort.direction);
            }
        }
    }
};

// Erweitere CO2App um Sort-Funktionalität
if (typeof CO2App !== 'undefined') {
    
    // Original renderTable erweitern
    const originalRenderTable = CO2App.renderTable;
    CO2App.renderTable = function() {
        originalRenderTable.call(this);
        
        // Sort-Icons nach Render aktualisieren
        setTimeout(() => {
            TableSort.updateSortIcons();
        }, 0);
    };
    
    // Original applyFilters erweitern
    const originalApplyFilters = CO2App.applyFilters;
    CO2App.applyFilters = function() {
        originalApplyFilters.call(this);
        
        // Sortierung nach Filter beibehalten
        TableSort.reapplySort();
    };
    
    // Sort-Icons aktualisieren
    TableSort.updateSortIcons = function() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            const direction = header.getAttribute('data-direction');
            const icon = header.querySelector('.sort-icon');
            
            if (icon) {
                switch (direction) {
                    case 'asc':
                        icon.textContent = ' ↑';
                        break;
                    case 'desc':
                        icon.textContent = ' ↓';
                        break;
                    default:
                        icon.textContent = ' ↕';
                }
            }
        });
    };
}

// TableSort initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis CO2App initialisiert ist
    setTimeout(() => {
        TableSort.init();
    }, 100);
});

// Export für Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableSort;
} 