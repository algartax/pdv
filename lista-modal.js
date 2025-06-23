// ========== SISTEMA DE MODAIS - LISTA DE PRODUTOS ==========

class ProductModal {
    constructor() {
        this.currentProduct = null;
        this.editMode = false;
        this.modalElement = document.getElementById('productModal');
        this.filterModalElement = document.getElementById('filterModal');
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('✅ Sistema de modais inicializado');
    }

    setupEventListeners() {
        // ESC para fechar modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isModalOpen(this.modalElement)) {
                    this.closeProductModal();
                } else if (this.isModalOpen(this.filterModalElement)) {
                    this.closeFilterModal();
                }
            }
        });

        // Clique fora para fechar
        [this.modalElement, this.filterModalElement].forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.modalElement) {
                        this.closeProductModal();
                    } else {
                        this.closeFilterModal();
                    }
                }
            });
        });
    }

    // ========== MODAL DE VISUALIZAÇÃO/EDIÇÃO ==========
    showViewModal(product) {
        this.currentProduct = product;
        this.editMode = false;
        
        document.getElementById('modalTitle').textContent = 'Detalhes do Produto';
        this.renderProductDetails(product);
        this.renderModalActions(false);
        
        this.modalElement.classList.add('show');
    }

    showEditModal(product) {
        this.currentProduct = product;
        this.editMode = true;
        
        document.getElementById('modalTitle').textContent = 'Editar Produto';
        this.renderEditForm(product);
        this.renderModalActions(true);
        
        this.modalElement.classList.add('show');
    }

    renderProductDetails(product) {
        const total = (product.preco || 0) * (product.quantidade || 0);
        const stockStatus = this.getStockStatus(product);

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="product-detail-grid">
                <div class="product-detail-item">
                    <div class="product-detail-label">Nome do Produto</div>
                    <div class="product-detail-value">${this.escapeHtml(product.descricao || '-')}</div>
                </div>
                
                ${product.codigo ? `
                <div class="product-detail-item">
                    <div class="product-detail-label">Código</div>
                    <div class="product-detail-value">${this.escapeHtml(product.codigo)}</div>
                </div>
                ` : ''}
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Categoria</div>
                    <div class="product-detail-value">${this.escapeHtml(product.categoria || '-')}</div>
                </div>
                
                ${product.marca ? `
                <div class="product-detail-item">
                    <div class="product-detail-label">Marca</div>
                    <div class="product-detail-value">${this.escapeHtml(product.marca)}</div>
                </div>
                ` : ''}
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Quantidade</div>
                    <div class="product-detail-value">
                        ${this.formatNumber(product.quantidade || 0)}
                        <div class="stock-status ${stockStatus.class}">
                            ${stockStatus.text}
                        </div>
                    </div>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Preço de Custo</div>
                    <div class="product-detail-value">R$ ${this.formatPrice(product.precocusto || 0)}</div>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Preço de Venda</div>
                    <div class="product-detail-value">R$ ${this.formatPrice(product.preco || 0)}</div>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Valor Total</div>
                    <div class="product-detail-value" style="font-size: 1.2em; font-weight: 700; color: var(--accent);">
                        R$ ${this.formatPrice(total)}
                    </div>
                </div>
                
                ${this.renderOptionalFields(product)}
            </div>
        `;
    }

    renderEditForm(product) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <form id="editProductForm" class="product-detail-grid">
                <div class="product-detail-item">
                    <div class="product-detail-label">Nome do Produto *</div>
                    <input type="text" name="descricao" class="product-detail-input" 
                           value="${this.escapeHtml(product.descricao || '')}" required>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Código</div>
                    <input type="text" name="codigo" class="product-detail-input" 
                           value="${this.escapeHtml(product.codigo || '')}">
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Categoria</div>
                    <select name="categoria" class="product-detail-input" id="editCategoria">
                        <option value="">Selecione...</option>
                    </select>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Marca</div>
                    <input type="text" name="marca" class="product-detail-input" 
                           value="${this.escapeHtml(product.marca || '')}">
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Quantidade *</div>
                    <input type="number" name="quantidade" class="product-detail-input" 
                           value="${product.quantidade || 0}" required min="0">
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Preço de Custo</div>
                    <input type="text" name="precocusto" class="product-detail-input price-mask" 
                           value="${this.formatPrice(product.precocusto || 0)}">
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Preço de Venda *</div>
                    <input type="text" name="preco" class="product-detail-input price-mask" 
                           value="${this.formatPrice(product.preco || 0)}" required>
                </div>
                
                <div class="product-detail-item">
                    <div class="product-detail-label">Estoque Mínimo</div>
                    <input type="number" name="estoqminimo" class="product-detail-input" 
                           value="${product.estoqminimo || 0}" min="0">
                </div>
                
                ${product.cor ? `
                <div class="product-detail-item">
                    <div class="product-detail-label">Cor</div>
                    <input type="text" name="cor" class="product-detail-input" 
                           value="${this.escapeHtml(product.cor || '')}">
                </div>
                ` : ''}
                
                ${product.grade ? `
                <div class="product-detail-item">
                    <div class="product-detail-label">Tamanho</div>
                    <input type="text" name="grade" class="product-detail-input" 
                           value="${this.escapeHtml(product.grade || '')}">
                </div>
                ` : ''}
                
                ${product.observacoes ? `
                <div class="product-detail-item" style="grid-column: 1 / -1;">
                    <div class="product-detail-label">Observações</div>
                    <textarea name="observacoes" class="product-detail-input" rows="3">${this.escapeHtml(product.observacoes || '')}</textarea>
                </div>
                ` : ''}
            </form>
        `;

        // Carregar categorias
        this.loadCategoriesForEdit(product.categoria);

        // Configurar máscaras de preço
        this.setupPriceMasks();

        // Mostrar todos os inputs
        document.querySelectorAll('.product-detail-input').forEach(input => {
            input.style.display = 'block';
        });
    }

    async loadCategoriesForEdit(currentCategory) {
        try {
            const categories = await window.SupaManager.getCategories();
            const select = document.getElementById('editCategoria');
            
            if (select && categories) {
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    option.selected = cat === currentCategory;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    setupPriceMasks() {
        document.querySelectorAll('.price-mask').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                value = value.replace(/[^\d,]/g, '');
                
                if (value.includes(',')) {
                    const parts = value.split(',');
                    if (parts.length > 2) {
                        value = parts[0] + ',' + parts[1];
                    }
                    if (parts[1] && parts[1].length > 2) {
                        value = parts[0] + ',' + parts[1].substring(0, 2);
                    }
                }
                
                e.target.value = value;
            });
        });
    }

    renderOptionalFields(product) {
        const fields = [
            { key: 'cor', label: 'Cor' },
            { key: 'grade', label: 'Tamanho' },
            { key: 'peso', label: 'Peso', suffix: ' kg' },
            { key: 'dimensoes', label: 'Dimensões' },
            { key: 'estoqminimo', label: 'Estoque Mínimo', format: 'number' },
            { key: 'fornecedor', label: 'Fornecedor' },
            { key: 'ncm', label: 'NCM' },
            { key: 'observacoes', label: 'Observações', fullWidth: true }
        ];

        return fields
            .filter(field => product[field.key])
            .map(field => `
                <div class="product-detail-item" ${field.fullWidth ? 'style="grid-column: 1 / -1;"' : ''}>
                    <div class="product-detail-label">${field.label}</div>
                    <div class="product-detail-value">
                        ${field.format === 'number' 
                            ? this.formatNumber(product[field.key])
                            : this.escapeHtml(product[field.key])
                        }${field.suffix || ''}
                    </div>
                </div>
            `)
            .join('');
    }

    renderModalActions(isEdit) {
        const actionsContainer = document.getElementById('modalActions');
        
        if (isEdit) {
            actionsContainer.innerHTML = `
                <button class="btn-secondary" onclick="productModal.cancelEdit()">Cancelar</button>
                <button class="btn-primary" onclick="productModal.saveProduct()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    Salvar Alterações
                </button>
            `;
        } else {
            actionsContainer.innerHTML = `
                <button class="btn-secondary" onclick="productModal.closeProductModal()">Fechar</button>
                <button class="btn-primary" onclick="productModal.switchToEdit()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                </button>
            `;
        }
    }

    switchToEdit() {
        if (this.currentProduct) {
            this.showEditModal(this.currentProduct);
        }
    }

    cancelEdit() {
        if (this.currentProduct) {
            this.showViewModal(this.currentProduct);
        }
    }

    async saveProduct() {
        const form = document.getElementById('editProductForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const updatedData = {};

        // Coletar dados do formulário
        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                if (key === 'preco' || key === 'precocusto') {
                    updatedData[key] = this.parsePrice(value);
                } else if (key === 'quantidade' || key === 'estoqminimo') {
                    updatedData[key] = parseInt(value) || 0;
                } else {
                    updatedData[key] = value.trim();
                }
            }
        }

        try {
            await window.SupaManager.updateProduct(this.currentProduct.id, updatedData);
            productsList.showToast('Produto atualizado com sucesso!', 'success');
            
            // Atualizar produto na lista
            Object.assign(this.currentProduct, updatedData);
            
            // Recarregar dados e fechar modal
            await productsList.loadData();
            this.closeProductModal();
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            productsList.showToast('Erro ao salvar alterações', 'error');
        }
    }

    closeProductModal() {
        this.modalElement.classList.remove('show');
        this.currentProduct = null;
        this.editMode = false;
    }

    // ========== MODAL DE FILTROS ==========
    openFilterModal() {
        this.loadCurrentFilters();
        this.filterModalElement.classList.add('show');
        
        setTimeout(() => {
            document.getElementById('searchInput')?.focus();
        }, 300);
    }

    closeFilterModal() {
        this.filterModalElement.classList.remove('show');
    }

    loadCurrentFilters() {
        if (!productsList) return;

        const filters = productsList.filters;
        
        document.getElementById('searchInput').value = filters.search || '';
        document.getElementById('categoryFilter').value = filters.category || '';
        document.getElementById('minPrice').value = filters.minPrice || '';
        document.getElementById('maxPrice').value = filters.maxPrice || '';
        document.getElementById('stockFilter').value = filters.stock || '';
        
        // Carregar ordenação atual
        const sortValue = productsList.currentSort + 
            (productsList.sortDirection === 'desc' ? '_desc' : '');
        document.getElementById('sortFilter').value = sortValue;
    }

    applyFilters() {
        const filters = {
            search: document.getElementById('searchInput').value,
            category: document.getElementById('categoryFilter').value,
            minPrice: this.parsePrice(document.getElementById('minPrice').value),
            maxPrice: this.parsePrice(document.getElementById('maxPrice').value),
            stock: document.getElementById('stockFilter').value
        };

        // Aplicar ordenação
        const sortValue = document.getElementById('sortFilter').value;
        const [field, direction] = sortValue.includes('_desc') 
            ? [sortValue.replace('_desc', ''), 'desc']
            : [sortValue, 'asc'];
        
        productsList.currentSort = field;
        productsList.sortDirection = direction;

        // Aplicar filtros
        window.applyFiltersFromModal(filters);
        
        this.closeFilterModal();
        productsList.showToast('Filtros aplicados', 'info');
    }

    clearAllFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('stockFilter').value = '';
        document.getElementById('sortFilter').value = 'descricao';
        
        const filters = {
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            stock: ''
        };
        
        productsList.currentSort = 'descricao';
        productsList.sortDirection = 'asc';
        
        window.applyFiltersFromModal(filters);
        productsList.showToast('Filtros limpos', 'info');
    }

    // ========== UTILITIES ==========
    getStockStatus(product) {
        const qty = product.quantidade || 0;
        const minStock = product.estoqminimo || 0;

        if (qty === 0) {
            return { class: 'zero', text: 'Sem estoque' };
        } else if (minStock > 0 && qty <= minStock) {
            return { class: 'low', text: 'Estoque baixo' };
        } else {
            return { class: 'normal', text: 'Normal' };
        }
    }

    isModalOpen(modal) {
        return modal?.classList.contains('show');
    }

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
}

// ========== GLOBAL INSTANCE ==========
let productModal;

document.addEventListener('DOMContentLoaded', () => {
    productModal = new ProductModal();
    window.productModal = productModal;
});

// ========== GLOBAL FUNCTIONS ==========
const closeProductModal = () => productModal?.closeProductModal();
const openFilterModal = () => productModal?.openFilterModal();
const closeFilterModal = () => productModal?.closeFilterModal();
const applyFilters = () => productModal?.applyFilters();
const clearAllFilters = () => productModal?.clearAllFilters();

console.log('🎯 Sistema de Modais carregado!');