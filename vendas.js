class VendasSystem {
    constructor() {
        this.sale = {
            items: [],
            customer: { nome: '', telefone: '', cpf: '' },
            discount: { type: 'percent', value: 0 },
            shipping: { value: 0, payer: 'cliente' },
            paymentMethod: '',
            paymentDetails: {}
        };
        
        this.cardMachines = {
            stone: { name: 'Stone', feeDebit: 2.5, feeCredit: 3.5 },
            mercadopago: { name: 'Mercado Pago', feeDebit: 2.8, feeCredit: 3.8 },
            pagseguro: { name: 'PagSeguro', feeDebit: 2.7, feeCredit: 3.7 },
            cielo: { name: 'Cielo', feeDebit: 2.6, feeCredit: 3.6 }
        };
        
        this.currentItemDiscountIndex = null;
        this.init();
    }

    init() {
        this.setupEvents();
        this.calculate();
        this.showToast('Sistema de vendas carregado!', 'success');
        this.focusProductCode();
    }

    focusProductCode() {
        const productCode = document.getElementById('productCode');
        if (productCode) setTimeout(() => productCode.focus(), 100);
    }

    setupEvents() {
        // Produtos
        document.getElementById('productCode')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProduct(e.target.value);
        });
        
        document.getElementById('scanBtn')?.addEventListener('click', () => {
            this.showToast('Scanner em desenvolvimento', 'info');
        });
        
        document.getElementById('addProductBtn')?.addEventListener('click', () => this.addManual());

        ['productName', 'productPrice', 'productQty'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addManual();
            });
        });

        // Cliente
        document.getElementById('customerName')?.addEventListener('input', (e) => {
            this.sale.customer.nome = e.target.value;
        });
        document.getElementById('customerPhone')?.addEventListener('input', (e) => {
            this.sale.customer.telefone = e.target.value;
        });
        document.getElementById('customerCpf')?.addEventListener('input', (e) => {
            this.sale.customer.cpf = e.target.value;
        });

        // Desconto geral
        document.querySelectorAll('.discount-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.discount-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.sale.discount.type = e.target.dataset.type;
                this.calculate();
            });
        });
        
        document.getElementById('discountValue')?.addEventListener('input', (e) => {
            this.sale.discount.value = parseFloat(e.target.value) || 0;
            this.calculate();
        });

        // Frete
        document.querySelectorAll('.shipping-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.shipping-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.sale.shipping.payer = e.target.dataset.payer;
                this.calculate();
            });
        });
        
        document.getElementById('shippingValue')?.addEventListener('input', (e) => {
            this.sale.shipping.value = parseFloat(e.target.value) || 0;
            this.calculate();
        });

        // Pagamento
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const method = e.currentTarget.dataset.method;
                
                if (method === 'cartao') {
                    // Esta função será movida para vendas_modal.js
                    if (window.VendasModalSystem) {
                        window.VendasModalSystem.openCardModal();
                    }
                } else if (method === 'crediario') {
                    // Esta função será movida para vendas_modal.js
                    if (window.VendasModalSystem) {
                        window.VendasModalSystem.openCrediarioModal();
                    }
                } else {
                    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    this.sale.paymentMethod = method;
                    this.sale.paymentDetails = {};
                    this.validate();
                }
            });
        });

        // Botões
        document.getElementById('clearSaleBtn')?.addEventListener('click', () => this.clear());
        document.getElementById('cancelSaleBtn')?.addEventListener('click', () => this.cancel());
        document.getElementById('completeSaleBtn')?.addEventListener('click', () => this.complete());

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter': e.preventDefault(); this.complete(); break;
                    case 'Escape': e.preventDefault(); this.cancel(); break;
                    case 'Delete': e.preventDefault(); this.clear(); break;
                }
            }
            if (e.key === 'Escape' && window.VendasModalSystem) {
                window.VendasModalSystem.closeAllModals();
            }
        });
    }

    searchProduct(code) {
        if (!code.trim()) return;
        
        const mockProducts = [
            { codigo: '123', nome: 'Produto Teste 1', preco: 25.90 },
            { codigo: '456', nome: 'Produto Teste 2', preco: 45.50 },
            { codigo: '789', nome: 'Produto Teste 3', preco: 15.00 }
        ];

        const found = mockProducts.find(p => p.codigo === code);
        
        if (found) {
            this.addProduct(found);
            this.showToast(`${found.nome} adicionado!`, 'success');
        } else {
            this.showToast('Produto não encontrado no estoque', 'warning');
            document.getElementById('productName')?.focus();
        }
    }

    addProduct(product) {
        const existing = this.sale.items.find(item => item.codigo === product.codigo);
        if (existing) {
            existing.quantidade += 1;
        } else {
            this.sale.items.push({
                ...product,
                quantidade: 1,
                precoOriginal: product.preco,
                desconto: { type: 'percent', value: 0 }
            });
        }

        this.render();
        this.calculate();
        this.clearProductForm();
    }

    addManual() {
        const code = document.getElementById('productCode')?.value.trim();
        const name = document.getElementById('productName')?.value.trim();
        const price = parseFloat(document.getElementById('productPrice')?.value) || 0;
        const qty = parseInt(document.getElementById('productQty')?.value) || 1;

        if (!name || price <= 0) {
            this.showToast('Preencha nome e preço válidos', 'warning');
            return;
        }

        const product = {
            codigo: code || `MANUAL_${Date.now()}`,
            nome: name,
            preco: price,
            quantidade: qty,
            precoOriginal: price,
            desconto: { type: 'percent', value: 0 }
        };

        const existing = this.sale.items.find(item => item.codigo === product.codigo);
        if (existing) {
            existing.quantidade += qty;
        } else {
            this.sale.items.push(product);
        }

        this.render();
        this.calculate();
        this.clearProductForm();
        this.showToast(`${name} adicionado!`, 'success');
    }

    updateQty(index, change) {
        const item = this.sale.items[index];
        item.quantidade += change;
        if (item.quantidade <= 0) {
            this.remove(index);
            return;
        }
        this.render();
        this.calculate();
    }

    setQty(index, value) {
        const qty = Math.max(1, parseInt(value) || 1);
        this.sale.items[index].quantidade = qty;
        this.render();
        this.calculate();
    }

    remove(index) {
        const item = this.sale.items.splice(index, 1)[0];
        this.render();
        this.calculate();
        this.showToast(`${item.nome} removido`, 'info');
    }

    render() {
        const container = document.getElementById('productsList');
        const count = document.getElementById('itemCount');

        if (!container || !count) return;

        if (this.sale.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 12h8"/>
                            <path d="M12 8v8"/>
                        </svg>
                    </div>
                    <p>Nenhum produto adicionado</p>
                    <small>Escaneie ou digite o código do produto</small>
                </div>
            `;
            count.textContent = '0 itens';
            return;
        }

        container.innerHTML = this.sale.items.map((item, index) => {
            const hasDiscount = item.desconto && item.desconto.value > 0;
            const discountText = hasDiscount 
                ? (item.desconto.type === 'percent' ? `${item.desconto.value}%` : `R$ ${this.fmt(item.desconto.value)}`)
                : '';

            return `
                <div class="product-item ${hasDiscount ? 'has-discount' : ''}">
                    <div class="product-info">
                        <div class="product-header">
                            <div class="product-name">${item.nome}</div>
                            <div class="product-code">${item.codigo}</div>
                        </div>
                        <div class="product-pricing">
                            ${hasDiscount ? `<div class="product-price original">R$ ${this.fmt(item.precoOriginal)}</div>` : ''}
                            <div class="product-price">R$ ${this.fmt(item.preco)}</div>
                            ${hasDiscount ? `<div class="product-discount-badge">${discountText} OFF</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="product-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateItemQty(${index}, -1)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                            <input type="number" class="qty-input" value="${item.quantidade}" 
                                   onchange="setItemQty(${index}, this.value)" min="1">
                            <button class="qty-btn" onclick="updateItemQty(${index}, 1)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <button class="item-discount-btn" onclick="openItemDiscountModal(${index})" title="Aplicar desconto neste item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="5" x2="5" y2="19"/>
                            <circle cx="6.5" cy="6.5" r="2.5"/>
                            <circle cx="17.5" cy="17.5" r="2.5"/>
                        </svg>
                    </button>
                    
                    <button class="remove-btn" onclick="removeItem(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        const totalItems = this.sale.items.reduce((sum, item) => sum + item.quantidade, 0);
        count.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    }

    calculateSaleTotal() {
        const subtotal = this.sale.items.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        const discount = this.sale.discount.type === 'percent' 
            ? (subtotal * this.sale.discount.value) / 100 
            : this.sale.discount.value;
        const shipping = this.sale.shipping.payer === 'cliente' ? this.sale.shipping.value : 0;
        return Math.max(0, subtotal - discount + shipping);
    }

    calculate() {
        const subtotal = this.sale.items.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        const discount = this.sale.discount.type === 'percent' 
            ? (subtotal * this.sale.discount.value) / 100 
            : this.sale.discount.value;
        const shipping = this.sale.shipping.payer === 'cliente' ? this.sale.shipping.value : 0;
        const total = Math.max(0, subtotal - discount + shipping);

        const elements = {
            'subtotalValue': `R$ ${this.fmt(subtotal)}`,
            'discountTotal': `- R$ ${this.fmt(discount)}`,
            'shippingTotal': `R$ ${this.fmt(this.sale.shipping.value)}`,
            'totalValue': `R$ ${this.fmt(total)}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        const shippingRow = document.querySelector('.shipping-row');
        if (shippingRow) {
            if (this.sale.shipping.payer === 'lojista') {
                shippingRow.classList.add('hidden');
            } else {
                shippingRow.classList.remove('hidden');
            }
        }

        this.validate();
    }

    validate() {
        const btn = document.getElementById('completeSaleBtn');
        if (btn) {
            const hasItems = this.sale.items.length > 0;
            const hasPayment = this.sale.paymentMethod !== '';
            btn.disabled = !(hasItems && hasPayment);
        }
    }

    // ========== FUNÇÃO COMPLETE COM SUPABASE ==========
    async complete() {
        if (this.sale.items.length === 0) {
            this.showToast('Adicione produtos à venda', 'warning');
            return;
        }
        if (!this.sale.paymentMethod) {
            this.showToast('Selecione a forma de pagamento', 'warning');
            return;
        }

        const btn = document.getElementById('completeSaleBtn');
        const originalBtnHTML = btn?.innerHTML;
        
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Salvando...`;
            btn.style.background = '#6b7280';
        }

        try {
            const saleData = { ...this.sale, total: this.calculateSaleTotal(), timestamp: new Date().toISOString() };
            
            if (!window.VendasSupabase) throw new Error('Sistema de banco não encontrado');
            
            this.showToast('Salvando no banco...', 'info', 2000);
            const result = await window.VendasSupabase.salvar(saleData);

            if (result.success) {
                // ✅ SUCESSO
                console.log('✅ Venda salva com sucesso:', result);
                
                // Preparar dados para o modal
                const dadosModal = {
                    vendaId: result.vendaId,
                    cliente: this.sale.customer.nome || 'Cliente não informado',
                    telefone: this.sale.customer.telefone || '',
                    cpf: this.sale.customer.cpf || '',
                    total: this.calculateSaleTotal(),
                    paymentMethod: this.sale.paymentMethod,
                    paymentDetails: this.sale.paymentDetails,
                    items: this.sale.items,
                    discount: this.sale.discount,
                    shipping: this.sale.shipping,
                    timestamp: new Date().toISOString()
                };
                
                // Mostrar modal de venda finalizada
                if (window.VendaFinalizadaModal) {
                    // Aguardar um pouco para o usuário ver o sucesso
                    setTimeout(() => {
                        window.VendaFinalizadaModal.show(dadosModal);
                    }, 1000);
                    
                    // Limpar venda após fechar o modal (automático após 30s ou manual)
                    setTimeout(() => {
                        this.clear();
                    }, 32000); // 30s do modal + 2s de margem
                    
                } else {
                    // Fallback se o modal não estiver disponível
                    let msg = `✅ Venda #${result.vendaId} finalizada!`;
                    if (this.sale.paymentMethod === 'cartao') msg += ` | Cartão ${this.sale.paymentDetails.installments}x`;
                    else if (this.sale.paymentMethod === 'crediario') msg += ` | Crediário ${this.sale.paymentDetails.installments}x`;
                    else if (this.sale.paymentMethod === 'pix') msg += ' | PIX';
                    else if (this.sale.paymentMethod === 'dinheiro') msg += ' | Dinheiro';
                    
                    this.showToast(msg, 'success', 5000);
                    setTimeout(() => { 
                        this.clear(); 
                        this.showToast('Nova venda iniciada', 'info'); 
                    }, 3000);
                }
            } else {
                throw new Error(result.message || 'Erro desconhecido');
            }
        } catch (error) {
            this.salvarBackupLocal({ ...this.sale, total: this.calculateSaleTotal(), timestamp: new Date().toISOString(), error: error.message });
            this.showToast(`❌ Erro: ${error.message}\n💾 Backup salvo localmente`, 'error', 8000);
        } finally {
            if (btn && originalBtnHTML) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHTML;
                btn.style.background = '';
            }
            setTimeout(() => this.validate(), 100);
        }
    }

    // ========== BACKUP LOCAL ==========
    salvarBackupLocal(saleData) {
        try {
            const backups = JSON.parse(localStorage.getItem('smartbiz_vendas_backup') || '[]');
            backups.push({ ...saleData, backup_timestamp: new Date().toISOString(), sync_status: 'pending' });
            if (backups.length > 50) backups.splice(0, backups.length - 50);
            localStorage.setItem('smartbiz_vendas_backup', JSON.stringify(backups));
            console.log('💾 Backup salvo:', backups.length, 'vendas');
        } catch (error) {
            console.error('❌ Erro backup:', error);
        }
    }

    clear() {
        this.sale = {
            items: [],
            customer: { nome: '', telefone: '', cpf: '' },
            discount: { type: 'percent', value: 0 },
            shipping: { value: 0, payer: 'cliente' },
            paymentMethod: '',
            paymentDetails: {}
        };

        ['productCode', 'productName', 'productPrice', 'customerName', 'customerPhone', 'customerCpf', 'discountValue', 'shippingValue'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        const qtyEl = document.getElementById('productQty');
        if (qtyEl) qtyEl.value = '1';
        
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.discount-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        const discountPercent = document.querySelector('.discount-toggle .toggle-btn[data-type="percent"]');
        if (discountPercent) discountPercent.classList.add('active');
        document.querySelectorAll('.shipping-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        const shippingCliente = document.querySelector('.shipping-toggle .toggle-btn[data-payer="cliente"]');
        if (shippingCliente) shippingCliente.classList.add('active');

        this.render();
        this.calculate();
        this.focusProductCode();
    }

    clearProductForm() {
        ['productCode', 'productName', 'productPrice'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const qtyEl = document.getElementById('productQty');
        if (qtyEl) qtyEl.value = '1';
        this.focusProductCode();
    }

    cancel() {
        if (this.sale.items.length > 0) {
            if (confirm('Tem certeza que deseja cancelar esta venda?')) {
                this.clear();
                this.showToast('Venda cancelada', 'info');
            }
        } else {
            this.showToast('Nenhuma venda para cancelar', 'info');
        }
    }

    fmt(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    // ========== TOAST OTIMIZADO ==========
    showToast(message, type = 'info', duration = 3000) {
        document.querySelectorAll(`.toast.${type}`).forEach(t => t.remove());

        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17.02" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        };
        const colors = {
            success: 'background:linear-gradient(135deg,#10b981,#059669);color:white;',
            error: 'background:linear-gradient(135deg,#ef4444,#dc2626);color:white;',
            warning: 'background:linear-gradient(135deg,#f59e0b,#d97706);color:white;',
            info: 'background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;'
        };

        toast.style.cssText = `${colors[type]||colors.info}padding:12px 16px;border-radius:8px;font-weight:500;font-size:14px;max-width:400px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.25);transform:translateX(100%);transition:all 0.3s ease;display:flex;align-items:flex-start;gap:8px;line-height:1.4;white-space:pre-line;word-wrap:break-word;pointer-events:auto;cursor:pointer;`;
        
        toast.innerHTML = `<div style="width:18px;height:18px;flex-shrink:0;margin-top:1px;">${icons[type]||icons.info}</div><div style="flex:1;">${message}</div>`;
        
        toast.addEventListener('click', () => { toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); });
        
        container.appendChild(toast);
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
        setTimeout(() => { toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.parentNode && toast.remove(), 300); }, duration);
    }
}

// ========== INICIALIZAÇÃO ==========
let vendasSystemInstance;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando VendasSystem...');
    vendasSystemInstance = new VendasSystem();
    
    // Atualizar as referências das funções globais
    window.updateItemQty = (index, change) => vendasSystemInstance?.updateQty(index, change);
    window.setItemQty = (index, value) => vendasSystemInstance?.setQty(index, value);
    window.removeItem = (index) => vendasSystemInstance?.remove(index);
    
    window.vendasSystem.complete = () => vendasSystemInstance?.complete();
});

// ========== FUNÇÕES GLOBAIS DIRETAS PARA COMPATIBILIDADE ==========
window.updateItemQty = (index, change) => vendasSystem?.updateQty(index, change);
window.setItemQty = (index, value) => vendasSystem?.setQty(index, value);
window.removeItem = (index) => vendasSystem?.remove(index);
window.openItemDiscountModal = (index) => window.VendasModalSystem?.openItemDiscountModal(index);

// ========== CRIAR OBJETO vendasSystem IMEDIATAMENTE ==========
window.vendasSystem = {
    updateQty: (index, change) => window.updateItemQty(index, change),
    setQty: (index, value) => window.setItemQty(index, value),
    remove: (index) => window.removeItem(index),
    complete: () => {
        if (window.vendasSystemInstance) {
            return window.vendasSystemInstance.complete();
        }
    },
    // Funções dos modais
    applyItemDiscount: () => window.VendasModalSystem?.applyItemDiscount(),
    closeModal: (modalId) => window.VendasModalSystem?.closeModal(modalId),
    completeCardSale: () => window.VendasModalSystem?.completeCardSale(),
    completeCrediarioSale: () => window.VendasModalSystem?.completeCrediarioSale(),
    openItemDiscountModal: (index) => window.VendasModalSystem?.openItemDiscountModal(index)
};

// ========== API PÚBLICA ==========
window.VendasSystem = {
    getCurrentSale: () => vendasSystemInstance?.sale,
    addProduct: (product) => vendasSystemInstance?.addProduct(product),
    clearSale: () => vendasSystemInstance?.clear(),
    showToast: (msg, type) => vendasSystemInstance?.showToast(msg, type),
    getCardMachines: () => vendasSystemInstance?.cardMachines,
    calculateSaleTotal: () => vendasSystemInstance?.calculateSaleTotal(),
    fmt: (value) => vendasSystemInstance?.fmt(value),
    validate: () => vendasSystemInstance?.validate(),
    render: () => vendasSystemInstance?.render(),
    calculate: () => vendasSystemInstance?.calculate()
};

console.log('🎯 Sistema de vendas PRINCIPAL carregado');

// ========== TESTE RÁPIDO ==========
window.testarVenda = () => {
    if (vendasSystemInstance) {
        vendasSystemInstance.addProduct({ codigo: 'TEST', nome: 'Produto Teste', preco: 50.00 });
        document.querySelector('.payment-option[data-method="pix"]')?.click();
        console.log('✅ Teste pronto - clique "Finalizar Venda"');
    }
};