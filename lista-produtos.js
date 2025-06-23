// ========== LISTA DE PRODUTOS - JAVASCRIPT OTIMIZADO ==========

class ProductsList {
    constructor() {
        this.supaManager = null;
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentSort = 'descricao';
        this.sortDirection = 'asc';
        this.filters = {
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            stock: ''
        };
        this.init();
    }

    async init() {
        try {
            await this.waitForDependencies();
            this.setupInterface();
            await this.loadData();
            console.log('✅ Lista de produtos carregada');
        } catch (error) {
            console.error('❌ Erro ao carregar lista:', error);
            this.showToast('Erro ao carregar produtos', 'error');
        }
    }

    async waitForDependencies() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (window.HeaderSystem && window.SupaManager) {
                    this.supaManager = window.SupaManager.getInstance();
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(check);
                if (window.SupaManager) {
                    this.supaManager = window.SupaManager.getInstance();
                }
                resolve();
            }, 5000);
        });
    }

    setupInterface() {
        this.setupSorting();
        this.setupFilters();
    }

    setupSorting() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                
                if (this.currentSort === sortField) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort = sortField;
                    this.sortDirection = 'asc';
                }

                document.querySelectorAll('.sortable').forEach(h => h.classList.remove('sorted'));
                header.classList.add('sorted');
                this.applyFilters();
            });
        });
    }

    setupFilters() {
        // Configuração básica dos filtros - a lógica principal está no modal
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filters.search = e.target.value;
            }, 300));
        }
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            if (!this.supaManager) {
                throw new Error('Gerenciador Supabase não disponível');
            }

            this.products = await window.SupaManager.loadProducts();
            await this.loadFilterOptions();
            this.applyFilters();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar produtos', 'error');
            this.showEmptyState('Erro ao carregar dados');
        } finally {
            this.showLoading(false);
        }
    }

    async loadFilterOptions() {
        try {
            const categories = await window.SupaManager.getCategories();
            this.populateFilterSelect('categoryFilter', categories);
        } catch (error) {
            console.error('Erro ao carregar opções de filtro:', error);
        }
    }

    populateFilterSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        
        if (defaultOption) {
            select.appendChild(defaultOption);
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    applyFilters() {
        let filtered = [...this.products];

        // Aplicar filtros
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.descricao?.toLowerCase().includes(searchTerm) ||
                product.codigo?.toLowerCase().includes(searchTerm)
            );
        }

        if (this.filters.category) {
            filtered = filtered.filter(product => product.categoria === this.filters.category);
        }

        if (this.filters.minPrice !== '' && !isNaN(this.filters.minPrice)) {
            filtered = filtered.filter(product => (product.preco || 0) >= this.filters.minPrice);
        }

        if (this.filters.maxPrice !== '' && !isNaN(this.filters.maxPrice)) {
            filtered = filtered.filter(product => (product.preco || 0) <= this.filters.maxPrice);
        }

        if (this.filters.stock) {
            filtered = filtered.filter(product => {
                const qty = product.quantidade || 0;
                const minStock = product.estoqminimo || 0;
                
                switch (this.filters.stock) {
                    case 'low': return qty > 0 && qty <= minStock;
                    case 'zero': return qty === 0;
                    case 'available': return qty > 0;
                    default: return true;
                }
            });
        }

        // Aplicar ordenação
        this.sortProducts(filtered);

        this.filteredProducts = filtered;
        this.currentPage = 1;
        
        this.updateActiveFiltersCount();
        this.renderProducts();
        this.updateCounters();
    }

    sortProducts(products) {
        products.sort((a, b) => {
            let aVal = a[this.currentSort] || '';
            let bVal = b[this.currentSort] || '';

            if (this.currentSort === 'total') {
                aVal = (a.preco || 0) * (a.quantidade || 0);
                bVal = (b.preco || 0) * (b.quantidade || 0);
            }

            if (['preco', 'quantidade', 'total'].includes(this.currentSort)) {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            if (aVal < bVal) comparison = -1;

            return this.sortDirection === 'desc' ? -comparison : comparison;
        });
    }

    updateActiveFiltersCount() {
        const activeCount = Object.values(this.filters).filter(value => 
            value !== '' && value !== null && value !== undefined
        ).length;

        const countElement = document.getElementById('activeFiltersCount');
        if (countElement) {
            countElement.textContent = activeCount;
            countElement.style.display = activeCount > 0 ? 'flex' : 'none';
        }
    }

    renderProducts() {
        if (this.filteredProducts.length === 0) {
            this.showEmptyState();
            return;
        }

        this.renderTableView();
        this.renderPagination();
    }

    renderTableView() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        tbody.innerHTML = pageProducts.map(product => 
            this.createTableRowHTML(product)
        ).join('');

        document.getElementById('tableView')?.classList.remove('hidden');
    }

    createTableRowHTML(product) {
        const total = (product.preco || 0) * (product.quantidade || 0);

        return `
            <tr>
                <td>
                    <div class="product-name">${this.escapeHtml(product.descricao || 'Sem nome')}</div>
                    ${product.codigo ? `<div class="product-code">Cód: ${this.escapeHtml(product.codigo)}</div>` : ''}
                </td>
                <td>
                    ${product.categoria ? `<span class="category-badge">${this.escapeHtml(product.categoria)}</span>` : '-'}
                </td>
                <td class="quantity-cell">
                    ${this.formatNumber(product.quantidade || 0)}
                </td>
                <td class="price-cell">R$ ${this.formatPrice(product.preco || 0)}</td>
                <td class="total-cell">R$ ${this.formatPrice(total)}</td>
                <td class="actions-cell">
                    <button class="action-btn view" onclick="productsList.viewProduct(${product.id})" title="Visualizar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn edit" onclick="productsList.editProduct(${product.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="productsList.deleteProduct(${product.id})" title="Excluir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M3 6h18l-2 13a2 2 0 0 1-2 1.87H7a2 2 0 0 1-2-1.87L3 6ZM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        document.getElementById('paginationInfo').textContent = `Página ${this.currentPage} de ${totalPages}`;
        document.getElementById('prevPageBtn').disabled = this.currentPage <= 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage >= totalPages;

        this.renderPageNumbers(totalPages);

        document.getElementById('paginationContainer').style.display = totalPages > 1 ? 'flex' : 'none';
    }

    renderPageNumbers(totalPages) {
        const pagesContainer = document.getElementById('paginationPages');
        if (!pagesContainer) return;

        pagesContainer.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            pagesContainer.appendChild(pageBtn);
        }
    }

    updateCounters() {
        document.getElementById('productsCount').textContent = this.products.length;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredProducts.length);
        
        document.getElementById('showingCount').textContent = 
            this.filteredProducts.length > 0 ? `${startIndex + 1}-${endIndex}` : '0';
        document.getElementById('totalCount').textContent = this.filteredProducts.length;
    }

    // ========== PRODUCT ACTIONS ==========
    async viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (window.productModal) {
            window.productModal.showViewModal(product);
        }
    }

    async editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (window.productModal) {
            window.productModal.showEditModal(product);
        }
    }

    async deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const confirmed = confirm(`Tem certeza que deseja excluir o produto "${product.descricao}"?`);
        if (!confirmed) return;

        try {
            await window.SupaManager.deleteProduct(productId);
            this.showToast('Produto excluído com sucesso!', 'success');
            
            this.products = this.products.filter(p => p.id !== productId);
            this.applyFilters();

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            this.showToast('Erro ao excluir produto', 'error');
        }
    }

    // ========== NAVIGATION ==========
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.goToPage(newPage);
        }
    }

    // ========== STATE MANAGEMENT ==========
    showLoading(show) {
        document.getElementById('loadingState')?.classList.toggle('hidden', !show);
        document.getElementById('tableView')?.classList.toggle('hidden', show);
        document.getElementById('emptyState')?.classList.add('hidden');
    }

    showEmptyState(message = null) {
        document.getElementById('emptyState')?.classList.remove('hidden');
        document.getElementById('tableView')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');

        if (message) {
            const subtitle = document.querySelector('.empty-subtitle');
            if (subtitle) subtitle.textContent = message;
        }
    }

    // ========== UTILITIES ==========
    formatPrice(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('pt-BR').format(value || 0);
    }

    parsePrice(value) {
        if (!value) return '';
        const cleanValue = String(value).replace(/[^\d,\.]/g, '').replace(',', '.');
        const numericValue = parseFloat(cleanValue);
        return isNaN(numericValue) ? '' : numericValue;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showToast(message, type = 'info', duration = 3000) {
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ========== GLOBAL INSTANCE ==========
let productsList;

document.addEventListener('DOMContentLoaded', () => {
    productsList = new ProductsList();
    window.productsList = productsList;
});

// ========== GLOBAL FUNCTIONS ==========
const refreshData = async () => {
    if (productsList) {
        await productsList.loadData();
        productsList.showToast('Dados atualizados', 'success');
    }
};

const changePage = (direction) => productsList?.changePage(direction);

// ========== FILTER MODAL INTEGRATION ==========
window.applyFiltersFromModal = (filters) => {
    if (productsList) {
        productsList.filters = { ...productsList.filters, ...filters };
        productsList.applyFilters();
    }
};

console.log('🚀 Sistema de Lista de Produtos Otimizado carregado!');