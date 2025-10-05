 
const CO2App = {
    data: [],
    filteredData: [],
    currentSort: { field: null, direction: 'asc' },
    
    init() {
        this.setupEventListeners();
        this.initializeDirectionSupport();
        this.loadCO2Data();
        this.setupSmoothScrolling();
        this.setupNavigation();
    },
    
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
        
        this.setupTableSorting();
        
        this.setupNavigation();
    },
    
    setupTableSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.getAttribute('data-sort');
                this.sortTable(sortField);
            });
        });
    },
    
    sortTable(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.updateSortIndicators();
        
        this.filteredData.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            
            if (field === 'emissions' || field === 'year') {
                aVal = Number(aVal);
                bVal = Number(bVal);
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }
            
            let result = 0;
            if (aVal < bVal) result = -1;
            if (aVal > bVal) result = 1;
            
            return this.currentSort.direction === 'desc' ? -result : result;
        });
        
        this.renderTable();
    },
    
    updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.removeAttribute('data-direction');
        });
        
        const currentHeader = document.querySelector(`[data-sort="${this.currentSort.field}"]`);
        if (currentHeader) {
            currentHeader.setAttribute('data-direction', this.currentSort.direction);
        }
    },
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav-desktop .nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#' && !href.includes('javascript:')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showMainSection(href.substring(1));
                });
            }
        });
        
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]:not(#impressum):not(#datenschutz):not(#nutzungsbedingungen)');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${sectionId}"], .navbar-nav-desktop .nav-link[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        });
    },
    
    showMainSection(sectionId) {
        const allSections = document.querySelectorAll('section');
        allSections.forEach(section => {
            const id = section.getAttribute('id');
            if (['impressum', 'datenschutz', 'nutzungsbedingungen'].includes(id)) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    
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
    
    initializeDirectionSupport() {
        const userLanguage = navigator.language || navigator.userLanguage;
        const rtlLanguages = ['ar', 'he', 'ur', 'fa', 'ps', 'sd'];
        
        const isRTL = rtlLanguages.some(lang => userLanguage.startsWith(lang));
        if (isRTL) {
            setDirection('rtl');
        }
    },
    
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
            this.showError('Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        } finally {
            this.showLoading(false);
        }
    },
    
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
    
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const mobileView = document.getElementById('mobileView');
        
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        Keine Daten gefunden. Bitte passen Sie Ihre Filter an.
                    </td>
                </tr>
            `;
            if (mobileView) {
                mobileView.innerHTML = `
                    <div class="text-center text-muted py-4">
                        Keine Daten gefunden. Bitte passen Sie Ihre Filter an.
                    </div>
                `;
            }
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
        
        if (mobileView) {
            mobileView.innerHTML = this.filteredData.map(item => `
                <div class="mobile-card">
                    <h6>${this.escapeHtml(item.country)}</h6>
                    <div class="row">
                        <div class="col-6">
                            <strong>Unternehmen:</strong><br>
                            <span class="text-muted">${item.company ? this.escapeHtml(item.company) : '—'}</span>
                        </div>
                        <div class="col-6">
                            <strong>Jahr:</strong><br>
                            <span class="text-muted">${item.year}</span>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-8">
                            <strong>CO2-Emissionen:</strong><br>
                            <span class="text-muted">${this.formatNumber(item.emissions)} Tonnen</span>
                        </div>
                        <div class="col-4">
                            <strong>Sektor:</strong><br>
                            <span class="badge bg-secondary">${this.escapeHtml(item.sector)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },
    
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
    
    formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/[<>\"'&]/g, '')
            .trim()
            .substring(0, 100);
    }
};

function toggleDirection() {
    const html = document.documentElement;
    const currentDir = html.getAttribute('dir') || 'ltr';
    const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDir);
}

function setDirection(direction) {
    const html = document.documentElement;
    const desired = direction === 'rtl' ? 'rtl' : 'ltr';
    const current = html.getAttribute('dir') || 'ltr';
    if (current === desired) return;
    html.setAttribute('dir', desired);
    
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.style.removeProperty('left');
        mobileNav.style.removeProperty('right');
        
        if (desired === 'rtl') {
            mobileNav.style.setProperty('left', '15px', 'important');
            mobileNav.style.setProperty('right', 'auto', 'important');
        } else {
            mobileNav.style.setProperty('left', 'auto', 'important');
            mobileNav.style.setProperty('right', '15px', 'important');
        }
    }
    
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('show');
    
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    
    mobileNav.style.removeProperty('left');
    mobileNav.style.removeProperty('right');
    
    if (currentDir === 'rtl') {
        mobileNav.style.setProperty('left', '15px', 'important');
        mobileNav.style.setProperty('right', 'auto', 'important');
    } else {
        mobileNav.style.setProperty('left', 'auto', 'important');
        mobileNav.style.setProperty('right', '15px', 'important');
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.remove('show');
}

document.addEventListener('click', function(event) {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileNav && menuBtn && !mobileNav.contains(event.target) && !menuBtn.contains(event.target)) {
        mobileNav.classList.remove('show');
    }
});

function showPage(pageId) {
    const mainSections = ['home', 'data', 'about'];
    mainSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('d-none');
    });
    
    const legalPages = ['impressum', 'datenschutz', 'nutzungsbedingungen'];
    legalPages.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('d-none');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('d-none');
        window.scrollTo(0, 0);
    }
}

function hideAllPages() {
    const legalPages = ['impressum', 'datenschutz', 'nutzungsbedingungen'];
    legalPages.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('d-none');
    });
    
    const mainSections = ['home', 'data', 'about'];
    mainSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.remove('d-none');
    });
    
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    CO2App.init();
    
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
} 