// ========== ÚLTIMAS VENDAS - MODAIS E PDF CORRIGIDO ==========

class SalesModalManager {
    constructor(salesManager) {
        this.salesManager = salesManager;
        this.currentSale = null;
        this.init();
    }

    init() {
        this.setupModalEvents();
        console.log('✅ SalesModalManager inicializado');
    }

    setupModalEvents() {
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSaleModal();
            }
        });

        // Fechar modal clicando no overlay
        document.getElementById('saleModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'saleModal') {
                this.closeSaleModal();
            }
        });
    }

    // ========== MODAL DE VISUALIZAÇÃO ==========
    async viewSaleDetails(saleId) {
        try {
            console.log('🔍 Buscando venda com ID:', saleId);
            console.log('📊 Vendas disponíveis:', this.salesManager.sales.length);
            
            // Converter saleId para string e number para comparação
            const sale = this.salesManager.sales.find(s => {
                return s.id == saleId || s.id === saleId || String(s.id) === String(saleId);
            });
            
            if (!sale) {
                console.error('❌ Venda não encontrada. ID buscado:', saleId);
                console.log('🔍 IDs disponíveis:', this.salesManager.sales.map(s => ({id: s.id, type: typeof s.id})));
                this.salesManager.showToast('Venda não encontrada', 'error');
                return;
            }

            console.log('✅ Venda encontrada:', sale);
            this.currentSale = sale;
            
            // Buscar informações do cliente se houver
            let clientInfo = null;
            if (sale.cliente) {
                console.log('👤 Buscando cliente ID:', sale.cliente);
                clientInfo = await this.getClientInfo(sale.cliente);
            }

            // Buscar informações do produto
            let productInfo = this.salesManager.products[sale.codigo] || null;
            console.log('📦 Produto encontrado:', productInfo);

            this.renderSaleModal(sale, clientInfo, productInfo);
            this.showSaleModal();

        } catch (error) {
            console.error('❌ Erro ao visualizar venda:', error);
            this.salesManager.showToast('Erro ao carregar detalhes da venda', 'error');
        }
    }

    async getClientInfo(clienteId) {
        try {
            console.log('🔍 Buscando cliente na tabela clientes...');
            
            const { data, error } = await this.salesManager.supabase
                .from('clientes')
                .select('*')
                .eq('id', clienteId)
                .eq('user', this.salesManager.currentUser.id)
                .single();

            if (error) {
                console.warn('⚠️ Cliente não encontrado na tabela clientes:', error.message);
                return null;
            }

            console.log('✅ Cliente encontrado:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Erro ao buscar cliente:', error);
            return null;
        }
    }

    renderSaleModal(sale, clientInfo, productInfo) {
        console.log('🎨 Renderizando modal para venda:', sale.id);
        
        // Calcular valores
        let unitPrice = sale.valorunit || 0;
        if (!unitPrice && productInfo) {
            unitPrice = productInfo.preco || 0;
        }
        
        const total = sale.valortotal || (unitPrice * (sale.quantidade || 0));
        const productName = sale.produto || productInfo?.descricao || 'Produto não encontrado';

        // Formatar data e hora
        const { displayDate, displayTime } = this.formatSaleDateTime(sale);

        // Atualizar título do modal
        document.getElementById('modalTitle').textContent = `Detalhes da Venda #${sale.id}`;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="sale-detail-container">
                <!-- Informações da Venda -->
                <div class="detail-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Informações da Venda
                        </h3>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>ID da Venda</label>
                            <span class="sale-id">#${sale.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Data</label>
                            <span>${displayDate || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Horário</label>
                            <span>${displayTime || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status</label>
                            <span class="status-badge completed">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22,4 12,14.01 9,11.01"/>
                                </svg>
                                Concluída
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Informações do Produto -->
                <div class="detail-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                            </svg>
                            Produto
                        </h3>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Código</label>
                            <span class="product-code-badge">${this.escapeHtml(sale.codigo || '-')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Nome do Produto</label>
                            <span class="product-name">${this.escapeHtml(productName)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Quantidade</label>
                            <span class="quantity-value">${sale.quantidade || 0} unidades</span>
                        </div>
                        <div class="detail-item">
                            <label>Preço Unitário</label>
                            <span class="price-value">R$ ${this.formatPrice(unitPrice)}</span>
                        </div>
                    </div>
                </div>

                <!-- Informações do Cliente -->
                ${this.renderClientSection(sale, clientInfo)}

                <!-- Informações de Pagamento -->
                <div class="detail-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            Pagamento
                        </h3>
                    </div>
                    <div class="detail-grid">
                        ${sale.formapagame ? `
                        <div class="detail-item">
                            <label>Forma de Pagamento</label>
                            <span>${this.escapeHtml(sale.formapagame)}</span>
                        </div>
                        ` : ''}
                        ${sale.parcelas ? `
                        <div class="detail-item">
                            <label>Parcelas</label>
                            <span>${sale.parcelas}x</span>
                        </div>
                        ` : ''}
                        ${sale.desconto || sale.descontogeral ? `
                        <div class="detail-item">
                            <label>Desconto</label>
                            <span class="discount-value">R$ ${this.formatPrice(sale.desconto || sale.descontogeral || 0)}</span>
                        </div>
                        ` : ''}
                        <div class="detail-item total-item">
                            <label>Valor Total</label>
                            <span class="total-value">R$ ${this.formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <!-- Informações Adicionais -->
                ${this.renderAdditionalInfo(sale)}

                <!-- Observações -->
                ${sale.observacoes ? `
                <div class="detail-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            Observações
                        </h3>
                    </div>
                    <div class="observations-content">
                        <p>${this.escapeHtml(sale.observacoes)}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Atualizar ações do modal
        this.updateModalActions(sale);
    }

    renderClientSection(sale, clientInfo) {
        if (!sale.cliente && !clientInfo) {
            return `
                <div class="detail-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Cliente
                        </h3>
                    </div>
                    <div class="no-client-info">
                        <p>Venda sem cliente cadastrado</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="detail-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Cliente
                    </h3>
                </div>
                <div class="detail-grid">
                    ${clientInfo ? `
                    <div class="detail-item">
                        <label>Nome</label>
                        <span>${this.escapeHtml(clientInfo.nome || '-')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Telefone</label>
                        <span>${this.escapeHtml(clientInfo.telefone || '-')}</span>
                    </div>
                    <div class="detail-item">
                        <label>CPF</label>
                        <span>${this.escapeHtml(clientInfo.cpf || '-')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email</label>
                        <span>${this.escapeHtml(clientInfo.email || '-')}</span>
                    </div>
                    ` : `
                    <div class="detail-item">
                        <label>ID do Cliente</label>
                        <span>${sale.cliente}</span>
                    </div>
                    <div class="detail-item colspan-3">
                        <span class="text-muted">Informações do cliente não encontradas</span>
                    </div>
                    `}
                </div>
            </div>
        `;
    }

    renderAdditionalInfo(sale) {
        const additionalFields = [];
        
        // Verificar campos que podem existir na venda
        if (sale.frete) additionalFields.push({label: 'Frete', value: `R$ ${this.formatPrice(sale.frete)}`});
        if (sale.pagafrete) additionalFields.push({label: 'Paga Frete', value: sale.pagafrete});
        if (sale.maquinacarta) additionalFields.push({label: 'Máquina/Carta', value: sale.maquinacarta});
        if (sale.parcelamaqui) additionalFields.push({label: 'Parcela Máquina', value: sale.parcelamaqui});
        if (sale.pagamaquina) additionalFields.push({label: 'Paga Máquina', value: sale.pagamaquina});
        if (sale.parcelacrediar) additionalFields.push({label: 'Parcela Crediar', value: sale.parcelacrediar});
        if (sale.juroscrediar) additionalFields.push({label: 'Juros Crediar', value: `R$ ${this.formatPrice(sale.juroscrediar)}`});

        if (additionalFields.length === 0) return '';

        return `
            <div class="detail-section">
                <div class="section-header">
                    <h3 class="section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Informações Adicionais
                    </h3>
                </div>
                <div class="detail-grid">
                    ${additionalFields.map(field => `
                        <div class="detail-item">
                            <label>${field.label}</label>
                            <span>${this.escapeHtml(field.value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateModalActions(sale) {
        const modalActions = document.querySelector('#saleModal .modal-actions');
        modalActions.innerHTML = `
            <button class="btn-secondary" onclick="salesModalManager.closeSaleModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Fechar
            </button>
            <button class="btn-primary" onclick="salesModalManager.printSalePDF('${sale.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9V2h12v7"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2 2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Imprimir PDF
            </button>
        `;
    }

    // ========== GERAÇÃO DE PDF ==========
    async printSalePDF(saleId) {
        try {
            console.log('🖨️ Gerando PDF para venda:', saleId);
            
            // Usar a venda atual se for a mesma, senão buscar
            let sale = this.currentSale;
            if (!sale || sale.id != saleId) {
                sale = this.salesManager.sales.find(s => s.id == saleId || String(s.id) === String(saleId));
            }
            
            if (!sale) {
                this.salesManager.showToast('Venda não encontrada para impressão', 'error');
                return;
            }

            // Buscar informações adicionais
            let clientInfo = null;
            if (sale.cliente) {
                clientInfo = await this.getClientInfo(sale.cliente);
            }

            const productInfo = this.salesManager.products[sale.codigo] || null;

            // Gerar HTML do PDF
            const pdfContent = this.generatePDFContent(sale, clientInfo, productInfo);

            // Abrir em nova aba para impressão
            const printWindow = window.open('', '_blank');
            printWindow.document.write(pdfContent);
            printWindow.document.close();

            // Aguardar carregar e chamar impressão
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };

            this.salesManager.showToast('PDF gerado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            this.salesManager.showToast('Erro ao gerar PDF', 'error');
        }
    }

    generatePDFContent(sale, clientInfo, productInfo) {
        // Calcular valores
        let unitPrice = sale.valorunit || 0;
        if (!unitPrice && productInfo) {
            unitPrice = productInfo.preco || 0;
        }
        
        const total = sale.valortotal || (unitPrice * (sale.quantidade || 0));
        const productName = sale.produto || productInfo?.descricao || 'Produto não encontrado';
        const { displayDate, displayTime } = this.formatSaleDateTime(sale);

        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprovante de Venda - #${sale.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .document-title {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0 5px 0;
        }
        
        .sale-number {
            font-size: 14px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            background: #f8fafc;
            padding: 8px 12px;
            border-left: 4px solid #2563eb;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 11px;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 12px;
            color: #333;
        }
        
        .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .product-table th,
        .product-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .product-table th {
            background: #f8fafc;
            font-weight: bold;
            font-size: 11px;
        }
        
        .product-table td {
            font-size: 12px;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .total-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        
        .total-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .total-final {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
        
        .observations {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 5px;
            padding: 12px;
            margin-top: 15px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-inside: avoid; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">SmartBiz</div>
        <div style="color: #666; font-size: 12px;">Sistema de Gestão Comercial</div>
        <div class="document-title">COMPROVANTE DE VENDA</div>
        <div class="sale-number">Nº ${sale.id}</div>
    </div>

    <div class="section">
        <div class="section-title">Informações da Venda</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Data da Venda</div>
                <div class="info-value">${displayDate || '-'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Horário</div>
                <div class="info-value">${displayTime || '-'}</div>
            </div>
        </div>
    </div>

    ${clientInfo ? `
    <div class="section">
        <div class="section-title">Dados do Cliente</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Nome</div>
                <div class="info-value">${this.escapeHtml(clientInfo.nome || '-')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Telefone</div>
                <div class="info-value">${this.escapeHtml(clientInfo.telefone || '-')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">CPF</div>
                <div class="info-value">${this.escapeHtml(clientInfo.cpf || '-')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${this.escapeHtml(clientInfo.email || '-')}</div>
            </div>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Produto Vendido</div>
        <table class="product-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th class="text-center">Qtd</th>
                    <th class="text-right">Valor Unit.</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${this.escapeHtml(sale.codigo || '-')}</td>
                    <td>${this.escapeHtml(productName)}</td>
                    <td class="text-center">${sale.quantidade || 0}</td>
                    <td class="text-right">R$ ${this.formatPrice(unitPrice)}</td>
                    <td class="text-right">R$ ${this.formatPrice(total)}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="total-section">
        <div class="total-item">
            <span>Subtotal:</span>
            <span>R$ ${this.formatPrice(total)}</span>
        </div>
        ${(sale.desconto || sale.descontogeral) ? `
        <div class="total-item">
            <span>Desconto:</span>
            <span>- R$ ${this.formatPrice(sale.desconto || sale.descontogeral || 0)}</span>
        </div>
        ` : ''}
        <div class="total-item total-final">
            <span>TOTAL GERAL:</span>
            <span>R$ ${this.formatPrice(total - (sale.desconto || sale.descontogeral || 0))}</span>
        </div>
    </div>

    ${sale.formapagame ? `
    <div class="section">
        <div class="section-title">Forma de Pagamento</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Método</div>
                <div class="info-value">${this.escapeHtml(sale.formapagame)}</div>
            </div>
            ${sale.parcelas ? `
            <div class="info-item">
                <div class="info-label">Parcelas</div>
                <div class="info-value">${sale.parcelas}x</div>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${sale.observacoes ? `
    <div class="observations">
        <strong>Observações:</strong><br>
        ${this.escapeHtml(sale.observacoes)}
    </div>
    ` : ''}

    <div class="footer">
        <p>Documento gerado automaticamente pelo SmartBiz em ${new Date().toLocaleString('pt-BR')}</p>
        <p>Este documento não possui valor fiscal</p>
    </div>
</body>
</html>
        `;
    }

    // ========== UTILITY METHODS ==========
    formatSaleDateTime(sale) {
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

        return { displayDate, displayTime };
    }

    formatPrice(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSaleModal() {
        document.getElementById('saleModal')?.classList.add('show');
    }

    closeSaleModal() {
        document.getElementById('saleModal')?.classList.remove('show');
        this.currentSale = null;
    }
}

// ========== ESTILOS ADICIONAIS PARA O MODAL ==========
const additionalStyles = `
<style>
.sale-detail-container {
    max-width: 100%;
}

.detail-section {
    margin-bottom: 25px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
}

.section-header {
    background: #f8fafc;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0;
}

.section-title svg {
    width: 16px;
    height: 16px;
    color: #2563eb;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-item.colspan-3 {
    grid-column: 1 / -1;
}

.detail-item label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    margin: 0;
}

.detail-item span {
    font-size: 14px;
    color: #111827;
}

.sale-id {
    font-family: monospace;
    background: #e0e7ff;
    color: #3730a3;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}

.product-code-badge {
    font-family: monospace;
    background: #f3f4f6;
    color: #374151;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 13px;
}

.product-name {
    font-weight: 500;
    color: #111827;
}

.quantity-value {
    font-weight: 600;
    color: #059669;
}

.price-value {
    font-weight: 500;
    color: #374151;
}

.discount-value {
    color: #dc2626;
    font-weight: 500;
}

.total-item {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 12px;
}

.total-item label {
    color: #92400e !important;
    font-weight: 600 !important;
}

.total-value {
    font-size: 18px !important;
    font-weight: 700 !important;
    color: #92400e !important;
}

.no-client-info {
    padding: 16px;
    text-align: center;
    color: #6b7280;
    font-style: italic;
}

.observations-content {
    padding: 16px;
}

.observations-content p {
    background: #f9fafb;
    border-left: 4px solid #2563eb;
    padding: 12px;
    margin: 0;
    border-radius: 0 4px 4px 0;
    font-style: italic;
    color: #374151;
}

.text-muted {
    color: #9ca3af !important;
    font-style: italic;
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .section-title {
        font-size: 13px;
    }
    
    .section-title svg {
        width: 14px;
        height: 14px;
    }
}
</style>
`;

// ========== INICIALIZAÇÃO ==========
let salesModalManager;

// Função global para ser chamada pelo botão de visualizar
window.viewSaleDetails = function(saleId) {
    console.log('🔍 viewSaleDetails chamada com ID:', saleId, typeof saleId);
    if (salesModalManager) {
        salesModalManager.viewSaleDetails(saleId);
    } else {
        console.error('❌ salesModalManager não está disponível');
    }
};

// Função global para ser chamada pelo botão de imprimir
window.printSalePDF = function(saleId) {
    console.log('🖨️ printSalePDF chamada com ID:', saleId, typeof saleId);
    if (salesModalManager) {
        salesModalManager.printSalePDF(saleId);
    } else {
        console.error('❌ salesModalManager não está disponível');
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar o salesManager estar disponível
    const checkSalesManager = setInterval(() => {
        if (window.salesManager) {
            salesModalManager = new SalesModalManager(window.salesManager);
            window.salesModalManager = salesModalManager;
            
            // Adicionar estilos ao head
            const styleElement = document.createElement('style');
            styleElement.innerHTML = additionalStyles.replace('<style>', '').replace('</style>', '');
            document.head.appendChild(styleElement);
            
            clearInterval(checkSalesManager);
            console.log('✅ SalesModalManager inicializado e vinculado ao SalesManager');
        }
    }, 100);
    
    // Timeout de segurança
    setTimeout(() => {
        clearInterval(checkSalesManager);
        if (!salesModalManager) {
            console.error('❌ Timeout: SalesManager não foi encontrado em 5 segundos');
        }
    }, 5000);
});

console.log('🚀 Sistema de Modais de Vendas carregado!');