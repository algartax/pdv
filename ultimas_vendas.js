// ========== ÚLTIMAS VENDAS - JAVASCRIPT COMPLETO ATUALIZADO ==========

class SalesManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.sales = [];
        this.filteredSales = [];
        this.products = {}; // Cache de produtos
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentSort = 'data';
        this.sortDirection = 'desc';
        this.filters = {
            period: '',
            startDate: '',
            endDate: '',
            search: ''
        };
        this.init();
    }

    async init() {
        try {
            await this.initSupabase();
            await this.getCurrentUser();
            this.setupInterface();
            await this.loadData();
            console.log('✅ Sistema de vendas carregado');
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            this.showToast('Erro ao carregar sistema', 'error');
        }
    }

    async initSupabase() {
        if (window.supabase) {
            const URL = 'https://duupmyhbsvitadcnkchq.supabase.co';
            const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXBteWhic3ZpdGFkY25rY2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDU1MjUsImV4cCI6MjA2MzQ4MTUyNX0.bFqBc0rEEbZXBKfsK6onBuxm62FK2NHeW_oBm757wL0';
            this.supabase = window.supabase.createClient(URL, KEY);
        } else {
            throw new Error('Supabase não encontrado');
        }
    }

    async getCurrentUser() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error || !session?.user) {
            throw new Error('Usuário não autenticado');
        }
        this.currentUser = session.user;
    }

    setupInterface() {
        // Sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                
                // Mapear campos de ordenação para colunas corretas
                let actualField = sortField;
                if (sortField === 'created_at') {
                    actualField = 'data';
                }
                
                if (this.currentSort === actualField) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort = actualField;
                    this.sortDirection = 'desc';
                }

                document.querySelectorAll('.sortable').forEach(h => h.classList.remove('sorted'));
                header.classList.add('sorted');
                this.applyFilters();
            });
        });

        // Period filter change
        document.getElementById('periodFilter')?.addEventListener('change', (e) => {
            const isCustom = e.target.value === 'custom';
            document.getElementById('customDateRange').style.display = isCustom ? 'block' : 'none';
            document.getElementById('customDateRangeEnd').style.display = isCustom ? 'block' : 'none';
        });

        // Search input
        document.getElementById('searchInput')?.addEventListener('input', this.debounce((e) => {
            this.filters.search = e.target.value;
        }, 300));
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Carregar vendas
            await this.loadSales();
            
            // Carregar produtos para cache
            await this.loadProducts();
            
            // Calcular estatísticas
            this.calculateStats();
            
            // Aplicar filtros
            this.applyFilters();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar vendas', 'error');
            this.showEmptyState();
        } finally {
            this.showLoading(false);
        }
    }

    async loadSales() {
        const { data, error } = await this.supabase
            .from('vendas')
            .select('*')
            .eq('user', this.currentUser.id)
            .order('data', { ascending: false })
            .order('hora', { ascending: false });

        if (error) throw error;

        this.sales = data || [];
    }

    async loadProducts() {
        const { data, error } = await this.supabase
            .from('cadastro')
            .select('id, codigo, descricao, preco')
            .eq('user', this.currentUser.id);

        if (error) {
            console.error('Erro ao carregar produtos:', error);
            return;
        }

        // Criar mapa de produtos por código
        this.products = {};
        data?.forEach(product => {
            this.products[product.codigo] = product;
        });
    }

    // Função para combinar data e hora em um objeto Date
    parseDateTime(dateStr, timeStr) {
        if (!dateStr) return new Date();
        
        // Se a data já está no formato ISO (YYYY-MM-DD)
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const time = timeStr || '00:00:00';
            return new Date(`${dateStr}T${time}`);
        }
        
        // Se a data está no formato brasileiro (DD/MM/YYYY)
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            const fullYear = year.length === 2 ? `20${year}` : year;
            const time = timeStr || '00:00:00';
            return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`);
        }
        
        // Se for um objeto Date
        if (dateStr instanceof Date) {
            return dateStr;
        }
        
        return new Date();
    }

    calculateStats() {
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD

        const todaySales = this.sales.filter(sale => {
            // Se a data for string no formato ISO
            if (typeof sale.data === 'string') {
                return sale.data === todayISO || sale.data === today.toLocaleDateString('pt-BR');
            }
            // Se for objeto Date
            if (sale.data instanceof Date) {
                return sale.data.toISOString().split('T')[0] === todayISO;
            }
            return false;
        });

        // Vendas hoje
        document.getElementById('salesToday').textContent = todaySales.length;

        // Faturamento hoje - usar valorunit ou valortotal da própria venda
        const todayRevenue = todaySales.reduce((sum, sale) => {
            // Primeiro tentar usar o valortotal da venda
            if (sale.valortotal) {
                return sum + sale.valortotal;
            }
            // Se não tiver, calcular com valorunit * quantidade
            if (sale.valorunit && sale.quantidade) {
                return sum + (sale.valorunit * sale.quantidade);
            }
            // Fallback para produtos cadastrados
            const product = this.products[sale.codigo];
            const price = product?.preco || 0;
            return sum + (price * (sale.quantidade || 0));
        }, 0);
        
        document.getElementById('revenueToday').textContent = this.formatPrice(todayRevenue);

        // Ticket médio
        const averageTicket = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;
        document.getElementById('averageTicket').textContent = `Ticket médio: R$ ${this.formatPrice(averageTicket)}`;

        // Total de vendas (30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysSales = this.sales.filter(sale => {
            const saleDate = this.parseDateTime(sale.data, sale.hora);
            return saleDate >= thirtyDaysAgo;
        });
        document.getElementById('totalSales').textContent = last30DaysSales.length;

        // Calcular tendência (comparar com ontem)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];
        
        const yesterdaySales = this.sales.filter(sale => {
            if (typeof sale.data === 'string') {
                return sale.data === yesterdayISO || sale.data === yesterday.toLocaleDateString('pt-BR');
            }
            if (sale.data instanceof Date) {
                return sale.data.toISOString().split('T')[0] === yesterdayISO;
            }
            return false;
        });

        const trend = yesterdaySales.length > 0 
            ? ((todaySales.length - yesterdaySales.length) / yesterdaySales.length * 100).toFixed(1)
            : 0;
        
        const trendElement = document.querySelector('.card-trend');
        if (trendElement) {
            trendElement.classList.toggle('positive', trend >= 0);
            trendElement.classList.toggle('negative', trend < 0);
            document.getElementById('todayTrend').textContent = `${trend >= 0 ? '+' : ''}${trend}%`;
        }
    }

    applyFilters() {
        let filtered = [...this.sales];

        // Filtro de período
        if (this.filters.period || this.filters.startDate) {
            filtered = this.filterByPeriod(filtered);
        }

        // Filtro de busca
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(sale => {
                const productName = sale.produto || this.products[sale.codigo]?.descricao || '';
                return sale.codigo?.toLowerCase().includes(searchTerm) ||
                       productName.toLowerCase().includes(searchTerm);
            });
        }

        // Ordenação
        this.sortSales(filtered);

        this.filteredSales = filtered;
        this.currentPage = 1;
        
        this.updateActiveFiltersCount();
        this.renderSales();
        this.updateCounters();
    }

    filterByPeriod(sales) {
        const now = new Date();
        const todayISO = now.toISOString().split('T')[0];
        let startDate, endDate;

        switch (this.filters.period) {
            case 'today':
                return sales.filter(sale => {
                    if (typeof sale.data === 'string') {
                        return sale.data === todayISO || sale.data === now.toLocaleDateString('pt-BR');
                    }
                    if (sale.data instanceof Date) {
                        return sale.data.toISOString().split('T')[0] === todayISO;
                    }
                    return false;
                });
                
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayISO = yesterday.toISOString().split('T')[0];
                return sales.filter(sale => {
                    if (typeof sale.data === 'string') {
                        return sale.data === yesterdayISO || sale.data === yesterday.toLocaleDateString('pt-BR');
                    }
                    if (sale.data instanceof Date) {
                        return sale.data.toISOString().split('T')[0] === yesterdayISO;
                    }
                    return false;
                });
                
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                endDate = new Date();
                break;
                
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                endDate = new Date();
                break;
                
            case 'custom':
                if (this.filters.startDate) {
                    startDate = new Date(this.filters.startDate);
                }
                if (this.filters.endDate) {
                    endDate = new Date(this.filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
                
            default:
                return sales;
        }

        return sales.filter(sale => {
            const saleDate = this.parseDateTime(sale.data, sale.hora);
            return (!startDate || saleDate >= startDate) && 
                   (!endDate || saleDate <= endDate);
        });
    }

    sortSales(sales) {
        sales.sort((a, b) => {
            let aVal, bVal;

            switch (this.currentSort) {
                case 'data':
                case 'created_at':
                    aVal = this.parseDateTime(a.data, a.hora);
                    bVal = this.parseDateTime(b.data, b.hora);
                    break;
                case 'quantidade':
                    aVal = a.quantidade || 0;
                    bVal = b.quantidade || 0;
                    break;
                case 'preco_unitario':
                    aVal = a.valorunit || this.products[a.codigo]?.preco || 0;
                    bVal = b.valorunit || this.products[b.codigo]?.preco || 0;
                    break;
                case 'total':
                    aVal = a.valortotal || ((a.valorunit || this.products[a.codigo]?.preco || 0) * (a.quantidade || 0));
                    bVal = b.valortotal || ((b.valorunit || this.products[b.codigo]?.preco || 0) * (b.quantidade || 0));
                    break;
                default:
                    return 0;
            }

            const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return this.sortDirection === 'desc' ? -comparison : comparison;
        });
    }

    updateActiveFiltersCount() {
        const activeCount = Object.values(this.filters).filter(value => value !== '').length;
        const countElement = document.getElementById('activeFiltersCount');
        if (countElement) {
            countElement.textContent = activeCount;
            countElement.style.display = activeCount > 0 ? 'flex' : 'none';
        }
    }

    renderSales() {
        if (this.filteredSales.length === 0) {
            this.showEmptyState();
            return;
        }

        this.renderTableView();
        this.renderPagination();
    }

    renderTableView() {
        const tbody = document.getElementById('salesTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSales = this.filteredSales.slice(startIndex, endIndex);

        tbody.innerHTML = pageSales.map(sale => this.createTableRowHTML(sale)).join('');
        document.getElementById('tableView')?.classList.remove('hidden');
    }

    createTableRowHTML(sale) {
        // Primeiro tentar usar valorunit da venda, senão buscar no produto
        let unitPrice = sale.valorunit || 0;
        if (!unitPrice) {
            const product = this.products[sale.codigo];
            unitPrice = product?.preco || 0;
        }

        // Usar valortotal da venda ou calcular
        const total = sale.valortotal || (unitPrice * (sale.quantidade || 0));

        // Formatar data
        let displayDate = '';
        let displayTime = '';
        
        if (sale.data) {
            if (typeof sale.data === 'string') {
                // Se está no formato ISO (YYYY-MM-DD)
                if (sale.data.includes('-')) {
                    const date = new Date(sale.data);
                    displayDate = date.toLocaleDateString('pt-BR');
                } else {
                    // Já está no formato brasileiro
                    displayDate = sale.data;
                }
            } else if (sale.data instanceof Date) {
                displayDate = sale.data.toLocaleDateString('pt-BR');
            }
        }

        if (sale.hora) {
            // Se a hora vem como HH:MM:SS, pegar só HH:MM
            displayTime = typeof sale.hora === 'string' ? sale.hora.slice(0, 5) : sale.hora;
        }

        // Nome do produto
        const productName = sale.produto || this.products[sale.codigo]?.descricao || 'Produto não encontrado';

        return `
            <tr>
                <td>
                    <div class="sale-date">${displayDate || '-'}</div>
                    <div class="sale-time">${displayTime || '-'}</div>
                </td>
                <td>
                    <span class="product-code">${this.escapeHtml(sale.codigo || '-')}</span>
                </td>
                <td>
                    <div class="product-name">${this.escapeHtml(productName)}</div>
                </td>
                <td class="quantity-cell">${sale.quantidade || 0}</td>
                <td class="price-cell">R$ ${this.formatPrice(unitPrice)}</td>
                <td class="total-cell">R$ ${this.formatPrice(total)}</td>
                <td>
                    <span class="status-badge completed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                        Concluída
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="action-btn view" onclick="viewSaleDetails('${sale.id}')" title="Visualizar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn print" onclick="printSalePDF('${sale.id}')" title="Imprimir PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M6 9V2h12v7"/>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2 2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect x="6" y="14" width="12" height="8"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        
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
        document.getElementById('salesCount').textContent = this.sales.length;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredSales.length);
        
        document.getElementById('showingCount').textContent = 
            this.filteredSales.length > 0 ? `${startIndex + 1}-${endIndex}` : '0';
        document.getElementById('totalCount').textContent = this.filteredSales.length;
    }

    // ========== SALE ACTIONS (VERSÃO ATUALIZADA) ==========
    viewSale(saleId) {
        // Agora delega para o SalesModalManager
        if (window.salesModalManager) {
            window.salesModalManager.viewSaleDetails(saleId);
        } else {
            this.showToast('Sistema de modais não carregado', 'error');
        }
    }

    printSale(saleId) {
        // Agora delega para o SalesModalManager
        if (window.salesModalManager) {
            window.salesModalManager.printSalePDF(saleId);
        } else {
            this.showToast('Sistema de impressão não carregado', 'error');
        }
    }

    // ========== NAVIGATION ==========
    goToPage(page) {
        this.currentPage = page;
        this.renderSales();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.goToPage(newPage);
        }
    }

    // ========== EXPORT ==========
    async exportSalesReport() {
        try {
            const reportData = this.filteredSales.map(sale => {
                // Calcular valores
                let unitPrice = sale.valorunit || 0;
                if (!unitPrice) {
                    const product = this.products[sale.codigo];
                    unitPrice = product?.preco || 0;
                }
                
                const total = sale.valortotal || (unitPrice * (sale.quantidade || 0));
                const productName = sale.produto || this.products[sale.codigo]?.descricao || 'Produto não encontrado';

                // Formatar data
                let displayDate = '';
                let displayTime = '';
                
                if (sale.data) {
                    if (typeof sale.data === 'string') {
                        if (sale.data.includes('-')) {
                            const date = new Date(sale.data);
                            displayDate = date.toLocaleDateString('pt-BR');
                        } else {
                            displayDate = sale.data;
                        }
                    } else if (sale.data instanceof Date) {
                        displayDate = sale.data.toLocaleDateString('pt-BR');
                    }
                }

                if (sale.hora) {
                    displayTime = typeof sale.hora === 'string' ? sale.hora.slice(0, 5) : sale.hora;
                }

                return {
                    'Data': displayDate || '',
                    'Hora': displayTime || '',
                    'Código': sale.codigo || '',
                    'Produto': productName,
                    'Quantidade': sale.quantidade || 0,
                    'Preço Unitário': this.formatPrice(unitPrice),
                    'Total': this.formatPrice(total)
                };
            });

            // Criar CSV
            const headers = Object.keys(reportData[0] || {});
            const csvContent = [
                headers.join(','),
                ...reportData.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        const stringValue = String(value).replace(/"/g, '""');
                        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
                    }).join(',')
                )
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showToast('Relatório exportado com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showToast('Erro ao exportar relatório', 'error');
        }
    }

    // ========== STATE MANAGEMENT ==========
    showLoading(show) {
        document.getElementById('loadingState')?.classList.toggle('hidden', !show);
        document.getElementById('tableView')?.classList.toggle('hidden', show);
        document.getElementById('emptyState')?.classList.add('hidden');
    }

    showEmptyState() {
        document.getElementById('emptyState')?.classList.remove('hidden');
        document.getElementById('tableView')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
    }

    // ========== UTILITIES ==========
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    formatPrice(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
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

// ========== FILTER MODAL FUNCTIONS ==========
function openFilterModal() {
    document.getElementById('filterModal').classList.add('show');
}

function closeFilterModal() {
    document.getElementById('filterModal').classList.remove('show');
}

function closeSaleModal() {
    document.getElementById('saleModal').classList.remove('show');
}

function applyFilters() {
    if (!salesManager) return;

    salesManager.filters = {
        period: document.getElementById('periodFilter').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        search: document.getElementById('searchInput').value
    };

    const sortValue = document.getElementById('sortFilter').value;
    const [field, direction] = sortValue.includes('_desc') 
        ? [sortValue.replace('_desc', ''), 'desc']
        : [sortValue, 'asc'];
    
    // Mapear created_at para data
    salesManager.currentSort = field === 'created_at' ? 'data' : field;
    salesManager.sortDirection = direction;

    salesManager.applyFilters();
    closeFilterModal();
}

function clearAllFilters() {
    document.getElementById('periodFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortFilter').value = 'created_at_desc';
    
    document.getElementById('customDateRange').style.display = 'none';
    document.getElementById('customDateRangeEnd').style.display = 'none';
    
    salesManager.filters = {
        period: '',
        startDate: '',
        endDate: '',
        search: ''
    };
    
    salesManager.currentSort = 'data';
    salesManager.sortDirection = 'desc';
    
    salesManager.applyFilters();
    salesManager.showToast('Filtros limpos', 'info');
}

// ========== GLOBAL FUNCTIONS ==========
const refreshData = async () => {
    if (salesManager) {
        await salesManager.loadData();
        salesManager.showToast('Dados atualizados', 'success');
    }
};

const changePage = (direction) => salesManager?.changePage(direction);
const exportSalesReport = () => salesManager?.exportSalesReport();

// ========== INITIALIZATION ==========
let salesManager;

document.addEventListener('DOMContentLoaded', () => {
    salesManager = new SalesManager();
    window.salesManager = salesManager;
});

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFilterModal();
        closeSaleModal();
    }
});

console.log('🚀 Sistema de Últimas Vendas carregado!');