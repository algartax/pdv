// ========== MODAL DE VENDA FINALIZADA MELHORADO ==========

class VendaFinalizadaModal {
    constructor() {
        this.modal = null;
        this.vendaAtual = null;
        this.pdfGerado = null; // Para reutilizar o PDF
        this.dadosEmpresa = {
            nome: 'SmartBiz Solutions',
            endereco: 'Rua das Empresas, 123 - Centro',
            cidade: 'Uberlândia - MG',
            cep: '38400-000',
            telefone: '(34) 3234-5678',
            email: 'contato@smartbiz.com.br',
            cnpj: '12.345.678/0001-90',
            ie: '123.456.789.123'
        };
        this.init();
    }

    init() {
        this.createModalHTML();
        this.setupEventListeners();
        console.log('✅ Modal de Venda Finalizada carregado');
    }

    createModalHTML() {
        // Remover modal existente se houver
        const existingModal = document.getElementById('vendaFinalizadaModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar modal (SEU DESIGN ORIGINAL + botão Email + botão Fechar)
        const modalHTML = `
            <div class="venda-modal-overlay" id="vendaFinalizadaModal">
                <div class="venda-modal">
                    <!-- Header de Sucesso -->
                    <div class="venda-modal-header">
                        <div class="success-animation">
                            <div class="checkmark">
                                <svg viewBox="0 0 52 52">
                                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path class="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
                                </svg>
                            </div>
                        </div>
                        <h2 class="success-title">🎉 Venda Finalizada!</h2>
                        <p class="success-subtitle">Pagamento processado com sucesso</p>
                    </div>

                    <!-- Detalhes da Venda -->
                    <div class="venda-details">
                        <div class="detail-row">
                            <span class="detail-label">Venda #</span>
                            <span class="detail-value" id="vendaId">000</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Cliente:</span>
                            <span class="detail-value" id="clienteNome">Cliente</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Valor Total:</span>
                            <span class="detail-value total-amount" id="valorTotal">R$ 0,00</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Pagamento:</span>
                            <span class="detail-value" id="formaPagamento">PIX</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Data/Hora:</span>
                            <span class="detail-value" id="dataHora">00/00/0000 00:00</span>
                        </div>
                    </div>

                    <!-- Ações (4 BOTÕES) -->
                    <div class="venda-actions">
                        <button class="action-btn secondary-btn" id="imprimirBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 6,2 18,2 18,9"/>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                                <rect x="6" y="14" width="12" height="8"/>
                            </svg>
                            Imprimir
                        </button>
                        
                        <button class="action-btn whats-btn" id="whatsappBtn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            Enviar WhatsApp
                        </button>

                        <button class="action-btn email-btn" id="emailBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Enviar Email
                        </button>
                        
                        <button class="action-btn primary-btn" id="novaVendaBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Nova Venda
                        </button>
                    </div>

                    <!-- Botão Fechar -->
                    <button class="close-btn" id="fecharBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Adicionar CSS (SEU CSS ORIGINAL + estilos para email + botão fechar)
        this.addModalCSS();
        
        // Adicionar ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('vendaFinalizadaModal');
    }

    addModalCSS() {
        // Verificar se o CSS já foi adicionado
        if (document.getElementById('vendaFinalizadaCSS')) return;

        const style = document.createElement('style');
        style.id = 'vendaFinalizadaCSS';
        style.textContent = `
            /* SEU CSS ORIGINAL */
            .venda-modal-overlay {
                position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center; z-index: 10000;
                opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .venda-modal-overlay.show { opacity: 1; visibility: visible; }
            .venda-modal {
                background: white; border-radius: 1.5rem; padding: 0; max-width: 500px; width: 90%;
                max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                transform: scale(0.9) translateY(20px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
            }
            .venda-modal-overlay.show .venda-modal { transform: scale(1) translateY(0); }
            
            .venda-modal-header {
                background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2rem;
                text-align: center; position: relative; overflow: hidden;
            }
            .venda-modal-header::before {
                content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: shimmer 3s ease-in-out infinite;
            }
            @keyframes shimmer {
                0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
                50% { transform: translateX(-50%) translateY(-50%) rotate(45deg); }
            }
            
            .success-animation { margin-bottom: 1rem; position: relative; z-index: 2; }
            .checkmark { width: 80px; height: 80px; margin: 0 auto; animation: scaleIn 0.6s ease-out 0.3s both; }
            .checkmark-circle {
                stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10;
                stroke: #10b981; fill: rgba(16, 185, 129, 0.1); animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark-check {
                transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48;
                stroke: #10b981; stroke-width: 3; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke { 100% { stroke-dashoffset: 0; } }
            @keyframes scaleIn { from { transform: scale(0) rotate(36deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
            
            .success-title {
                font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; position: relative; z-index: 2;
                animation: slideInUp 0.6s ease-out 0.6s both;
            }
            .success-subtitle {
                font-size: 1rem; opacity: 0.9; margin: 0; position: relative; z-index: 2;
                animation: slideInUp 0.6s ease-out 0.8s both;
            }
            @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .venda-details { padding: 2rem; border-bottom: 1px solid #e5e7eb; }
            .detail-row {
                display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0;
                border-bottom: 1px solid #f3f4f6; animation: fadeInLeft 0.5s ease-out backwards;
            }
            .detail-row:nth-child(1) { animation-delay: 1s; }
            .detail-row:nth-child(2) { animation-delay: 1.1s; }
            .detail-row:nth-child(3) { animation-delay: 1.2s; }
            .detail-row:nth-child(4) { animation-delay: 1.3s; }
            .detail-row:nth-child(5) { animation-delay: 1.4s; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 500; color: #6b7280; font-size: 0.9rem; }
            .detail-value { font-weight: 600; color: #111827; font-size: 0.9rem; }
            .total-amount { font-size: 1.25rem; color: #10b981; font-weight: 700; }
            @keyframes fadeInLeft { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            
            /* AÇÕES ATUALIZADA PARA 4 BOTÕES */
            .venda-actions {
                padding: 1.5rem 2rem 2rem; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem;
            }
            .action-btn {
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
                padding: 0.875rem; border: none; border-radius: 1rem; font-weight: 600; font-size: 0.8rem;
                cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); min-height: 75px;
                position: relative; overflow: hidden; animation: slideInUp 0.5s ease-out backwards;
            }
            .action-btn:nth-child(1) { animation-delay: 1.5s; }
            .action-btn:nth-child(2) { animation-delay: 1.6s; }
            .action-btn:nth-child(3) { animation-delay: 1.7s; }
            .action-btn:nth-child(4) { animation-delay: 1.8s; }
            .action-btn svg { width: 22px; height: 22px; transition: transform 0.2s ease; }
            .action-btn:hover svg { transform: scale(1.1); }
            .action-btn::before {
                content: ''; position: absolute; inset: 0;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                transform: translateX(-100%); transition: transform 0.6s ease;
            }
            .action-btn:hover::before { transform: translateX(100%); }
            
            .secondary-btn { background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb; }
            .secondary-btn:hover { background: #e5e7eb; transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
            .whats-btn { background: linear-gradient(135deg, #25d366, #20ba5a); color: white; border: 2px solid #25d366; }
            .whats-btn:hover { background: linear-gradient(135deg, #20ba5a, #1da851); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(37, 211, 102, 0.4); }
            .email-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: 2px solid #3b82f6; }
            .email-btn:hover { background: linear-gradient(135deg, #2563eb, #1d4ed8); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4); }
            .primary-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: 2px solid #f59e0b; }
            .primary-btn:hover { background: linear-gradient(135deg, #d97706, #b45309); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4); }
            
            /* BOTÃO FECHAR */
            .close-btn {
                position: absolute; top: 1rem; right: 1rem; width: 40px; height: 40px; border: none;
                background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 50%;
                color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: all 0.3s ease; z-index: 10;
            }
            .close-btn:hover { background: rgba(255, 255, 255, 0.3); transform: scale(1.1); }
            .close-btn svg { width: 20px; height: 20px; }
            
            .loading-dots { display: inline-flex; gap: 4px; margin-left: 8px; }
            .loading-dots span {
                width: 4px; height: 4px; background: currentColor; border-radius: 50%;
                animation: loadingDots 1.4s ease-in-out infinite both;
            }
            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
            .loading-dots span:nth-child(3) { animation-delay: 0s; }
            @keyframes loadingDots { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
            
            @media (max-width: 768px) {
                .venda-modal { width: 95%; margin: 1rem; }
                .venda-actions { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .action-btn { flex-direction: row; min-height: 60px; gap: 0.5rem; font-size: 0.75rem; }
                .success-title { font-size: 1.5rem; }
                .venda-details { padding: 1.5rem; }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'imprimirBtn') {
                this.imprimirPDF();
            } else if (e.target.id === 'whatsappBtn') {
                this.enviarWhatsApp();
            } else if (e.target.id === 'emailBtn') {
                this.enviarEmail();
            } else if (e.target.id === 'novaVendaBtn') {
                this.novaVenda();
            } else if (e.target.id === 'fecharBtn') {
                this.fechar();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('show')) {
                this.fechar();
            }
        });
    }

    show(dadosVenda) {
        console.log('🎉 Mostrando modal de venda finalizada:', dadosVenda);
        
        this.vendaAtual = dadosVenda;
        this.pdfGerado = null; // Reset PDF
        
        // Fechar outros modais
        this.fecharOutrosModais();
        
        // Preencher dados
        this.preencherDados(dadosVenda);
        
        // Mostrar modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    fecharOutrosModais() {
        // Fechar modais de pagamento
        const modals = ['cardModal', 'crediarioModal', 'itemDiscountModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }

    preencherDados(dados) {
        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Preencher elementos
        document.getElementById('vendaId').textContent = dados.vendaId || Math.floor(Date.now() / 1000);
        document.getElementById('clienteNome').textContent = dados.cliente || 'Cliente não informado';
        document.getElementById('valorTotal').textContent = `R$ ${this.formatarMoeda(dados.total || 0)}`;
        document.getElementById('formaPagamento').textContent = this.formatarFormaPagamento(dados.paymentMethod, dados.paymentDetails);
        document.getElementById('dataHora').textContent = `${dataFormatada} ${horaFormatada}`;
    }

    formatarFormaPagamento(method, details) {
        const formas = {
            'dinheiro': 'Dinheiro',
            'pix': 'PIX',
            'cartao': `Cartão ${details?.installments || 1}x`,
            'crediario': `Crediário ${details?.installments || 1}x`
        };
        return formas[method] || method;
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor || 0);
    }

    // ========== GERAÇÃO DE PDF PROFISSIONAL ==========
    async gerarPDF() {
        if (this.pdfGerado) return this.pdfGerado; // Reutilizar se já gerado

        try {
            if (typeof window.jsPDF === 'undefined') await this.carregarJsPDF();

            // Verificar se jsPDF carregou corretamente
            if (!window.jsPDF || !window.jsPDF.jsPDF) {
                throw new Error('jsPDF não carregou corretamente');
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            let yPos = margin;

            // Cores
            const green = [16, 185, 129];
            const gray = [107, 114, 128];
            const black = [17, 24, 39];

            // ========== CABEÇALHO EMPRESA ==========
            doc.setFillColor(...green);
            doc.rect(0, 0, pageWidth, 60, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text(this.dadosEmpresa.nome, margin, 25);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(this.dadosEmpresa.endereco, margin, 35);
            doc.text(`${this.dadosEmpresa.cidade} - ${this.dadosEmpresa.cep}`, margin, 42);
            doc.text(`Tel: ${this.dadosEmpresa.telefone} | Email: ${this.dadosEmpresa.email}`, margin, 49);
            doc.text(`CNPJ: ${this.dadosEmpresa.cnpj} | IE: ${this.dadosEmpresa.ie}`, margin, 56);

            // ========== TÍTULO ==========
            yPos = 80;
            doc.setTextColor(...black);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('CUPOM NÃO FISCAL', pageWidth / 2, yPos, { align: 'center' });

            // ========== DADOS VENDA ==========
            yPos += 20;
            doc.setDrawColor(...gray);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPos, pageWidth - 2 * margin, 40);
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            
            const agora = new Date();
            const dataHora = agora.toLocaleString('pt-BR');
            
            doc.text(`Venda #: ${this.vendaAtual?.vendaId || 'N/A'}`, margin + 5, yPos + 10);
            doc.text(`Data/Hora: ${dataHora}`, pageWidth - margin - 5, yPos + 10, { align: 'right' });
            doc.text(`Cliente: ${this.vendaAtual?.cliente || 'Cliente não informado'}`, margin + 5, yPos + 20);
            doc.text(`Pagamento: ${this.formatarFormaPagamento(this.vendaAtual?.paymentMethod, this.vendaAtual?.paymentDetails)}`, pageWidth - margin - 5, yPos + 20, { align: 'right' });
            
            if (this.vendaAtual?.telefone || this.vendaAtual?.cpf) {
                let dadosCliente = '';
                if (this.vendaAtual.telefone) dadosCliente += `Tel: ${this.vendaAtual.telefone}`;
                if (this.vendaAtual.cpf) dadosCliente += (dadosCliente ? ' | ' : '') + `CPF: ${this.vendaAtual.cpf}`;
                doc.text(dadosCliente, margin + 5, yPos + 30);
            }

            // ========== PRODUTOS ==========
            yPos += 60;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('PRODUTOS VENDIDOS', margin, yPos);
            
            yPos += 10;
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F');
            
            doc.setFontSize(9);
            doc.text('PRODUTO', margin + 5, yPos + 10);
            doc.text('QTD', margin + 100, yPos + 10, { align: 'center' });
            doc.text('PREÇO UNIT.', margin + 130, yPos + 10, { align: 'center' });
            doc.text('TOTAL', pageWidth - margin - 5, yPos + 10, { align: 'right' });
            
            yPos += 15;
            
            if (this.vendaAtual?.items?.length > 0) {
                doc.setFont(undefined, 'normal');
                this.vendaAtual.items.forEach((item, index) => {
                    const subtotal = item.quantidade * item.preco;
                    
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(margin, yPos, pageWidth - 2 * margin, 12, 'F');
                    }
                    
                    doc.text(item.nome, margin + 5, yPos + 8);
                    doc.text(item.quantidade.toString(), margin + 100, yPos + 8, { align: 'center' });
                    doc.text(`R$ ${this.formatarMoeda(item.preco)}`, margin + 130, yPos + 8, { align: 'center' });
                    doc.text(`R$ ${this.formatarMoeda(subtotal)}`, pageWidth - margin - 5, yPos + 8, { align: 'right' });
                    
                    doc.setFontSize(7);
                    doc.setTextColor(...gray);
                    doc.text(`Cód: ${item.codigo}`, margin + 5, yPos + 11);
                    doc.setFontSize(9);
                    doc.setTextColor(...black);
                    
                    yPos += 12;
                });
            }

            // ========== TOTAIS ==========
            yPos += 10;
            const subtotal = this.vendaAtual?.items?.reduce((sum, item) => sum + (item.quantidade * item.preco), 0) || 0;
            
            doc.setDrawColor(...green);
            doc.setLineWidth(1);
            doc.rect(pageWidth - 80, yPos, 60, 40);
            
            doc.setFontSize(10);
            doc.text('Subtotal:', pageWidth - 75, yPos + 10);
            doc.text(`R$ ${this.formatarMoeda(subtotal)}`, pageWidth - 25, yPos + 10, { align: 'right' });
            
            if (this.vendaAtual?.discount?.value > 0) {
                const desconto = this.vendaAtual.discount.type === 'percent' 
                    ? (subtotal * this.vendaAtual.discount.value) / 100 
                    : this.vendaAtual.discount.value;
                doc.text('Desconto:', pageWidth - 75, yPos + 20);
                doc.text(`-R$ ${this.formatarMoeda(desconto)}`, pageWidth - 25, yPos + 20, { align: 'right' });
            }
            
            if (this.vendaAtual?.shipping?.value > 0 && this.vendaAtual?.shipping?.payer === 'cliente') {
                doc.text('Frete:', pageWidth - 75, yPos + 30);
                doc.text(`R$ ${this.formatarMoeda(this.vendaAtual.shipping.value)}`, pageWidth - 25, yPos + 30, { align: 'right' });
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setFillColor(...green);
            doc.rect(pageWidth - 80, yPos + 35, 60, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL:', pageWidth - 75, yPos + 45);
            doc.text(`R$ ${this.formatarMoeda(this.vendaAtual?.total || 0)}`, pageWidth - 25, yPos + 45, { align: 'right' });

            // ========== RODAPÉ ==========
            doc.setTextColor(...gray);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text('✅ Pagamento Aprovado! Obrigado pela preferência!', pageWidth / 2, doc.internal.pageSize.height - 30, { align: 'center' });
            doc.text('Documento gerado automaticamente pelo SmartBiz POS', pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });
            doc.text(`Gerado em: ${agora.toLocaleString('pt-BR')}`, pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });

            this.pdfGerado = doc; // Salvar para reutilizar
            return doc;

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    async carregarJsPDF() {
        return new Promise((resolve, reject) => {
            if (document.getElementById('jspdf-script')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.id = 'jspdf-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                // Aguardar um pouco para garantir que jsPDF está disponível
                setTimeout(resolve, 200);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ========== IMPRIMIR PDF ==========
    async imprimirPDF() {
        const btn = document.getElementById('imprimirBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Gerando<span class="loading-dots"><span></span><span></span><span></span></span>
            `;
            btn.disabled = true;

            const doc = await this.gerarPDF();
            
            // Criar blob do PDF
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Abrir em nova janela para impressão
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            }

            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Impresso!
            `;

            this.showToast('🖨️ PDF aberto para impressão!', 'success');

        } catch (error) {
            console.error('Erro ao imprimir:', error);
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Erro!
            `;
            this.showToast('❌ Erro ao imprimir PDF. Verifique sua conexão.', 'error');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    }

    // ========== WHATSAPP COM IMAGEM DO COMPROVANTE ==========
    async enviarWhatsApp() {
        const btn = document.getElementById('whatsappBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Criando Comprovante<span class="loading-dots"><span></span><span></span><span></span></span>
            `;
            btn.disabled = true;

            // Gerar imagem do comprovante
            const imagemBase64 = await this.gerarImagemComprovante();
            
            // Criar mensagem simples (imagem vai como anexo)
            const mensagem = `🏪 *${this.dadosEmpresa.nome}*\n\n🧾 *COMPROVANTE DE VENDA*\n\n🆔 Venda #${this.vendaAtual?.vendaId || 'N/A'}\n👤 Cliente: ${this.vendaAtual?.cliente || 'Cliente não informado'}\n💰 Total: R$ ${this.formatarMoeda(this.vendaAtual?.total || 0)}\n💳 Pagamento: ${this.formatarFormaPagamento(this.vendaAtual?.paymentMethod, this.vendaAtual?.paymentDetails)}\n\n✅ *Pagamento Aprovado!*\nObrigado pela preferência! 😊`;
            
            // Obter telefone
            let telefone = this.vendaAtual?.telefone || '';
            telefone = telefone.replace(/\D/g, '');
            if (telefone.length === 11 && telefone.startsWith('0')) telefone = telefone.substring(1);
            if (telefone.length === 10 || telefone.length === 11) telefone = '55' + telefone;

            // URL WhatsApp
            const whatsappURL = telefone && telefone.length >= 12 
                ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
                : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Enviado!
            `;

            // Baixar a imagem automaticamente para anexar no WhatsApp
            this.baixarImagem(imagemBase64);

            setTimeout(() => window.open(whatsappURL, '_blank'), 500);
            this.showToast(`📱 Imagem do comprovante baixada!\n📤 Anexe no WhatsApp que abriu`, 'success');

        } catch (error) {
            console.error('Erro WhatsApp:', error);
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Erro!
            `;
            this.showToast('❌ Erro ao gerar comprovante', 'error');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    }

    // ========== GERAR IMAGEM PROFISSIONAL DO COMPROVANTE ==========
    async gerarImagemComprovante() {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Definir tamanho (formato cupom)
                canvas.width = 400;
                canvas.height = 600;
                
                // Fundo branco
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                let y = 30;
                const centerX = canvas.width / 2;
                const margin = 20;
                
                // ========== CABEÇALHO EMPRESA ==========
                ctx.fillStyle = '#10b981';
                ctx.fillRect(0, 0, canvas.width, 80);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.dadosEmpresa.nome, centerX, 30);
                
                ctx.font = '12px Arial';
                ctx.fillText(this.dadosEmpresa.endereco, centerX, 50);
                ctx.fillText(`${this.dadosEmpresa.cidade} - ${this.dadosEmpresa.cep}`, centerX, 65);
                
                y = 100;
                
                // ========== TÍTULO ==========
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('COMPROVANTE DE VENDA', centerX, y);
                y += 30;
                
                // ========== LINHA SEPARADORA ==========
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(margin, y);
                ctx.lineTo(canvas.width - margin, y);
                ctx.stroke();
                y += 20;
                
                // ========== DADOS DA VENDA ==========
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                
                const agora = new Date();
                const dataHora = agora.toLocaleString('pt-BR');
                
                const dados = [
                    `Venda #: ${this.vendaAtual?.vendaId || 'N/A'}`,
                    `Data/Hora: ${dataHora}`,
                    `Cliente: ${this.vendaAtual?.cliente || 'Cliente não informado'}`,
                    `Pagamento: ${this.formatarFormaPagamento(this.vendaAtual?.paymentMethod, this.vendaAtual?.paymentDetails)}`
                ];
                
                if (this.vendaAtual?.telefone) {
                    dados.push(`Telefone: ${this.vendaAtual.telefone}`);
                }
                if (this.vendaAtual?.cpf) {
                    dados.push(`CPF: ${this.vendaAtual.cpf}`);
                }
                
                dados.forEach(texto => {
                    ctx.fillText(texto, margin, y);
                    y += 18;
                });
                
                y += 10;
                
                // ========== PRODUTOS ==========
                ctx.font = 'bold 14px Arial';
                ctx.fillText('PRODUTOS:', margin, y);
                y += 20;
                
                ctx.font = '11px Arial';
                if (this.vendaAtual?.items?.length > 0) {
                    this.vendaAtual.items.forEach(item => {
                        const subtotal = item.quantidade * item.preco;
                        ctx.fillText(`• ${item.nome}`, margin, y);
                        y += 15;
                        ctx.fillText(`  ${item.quantidade}x R$ ${this.formatarMoeda(item.preco)} = R$ ${this.formatarMoeda(subtotal)}`, margin + 10, y);
                        y += 18;
                    });
                }
                
                y += 10;
                
                // ========== TOTAIS ==========
                const subtotal = this.vendaAtual?.items?.reduce((sum, item) => sum + (item.quantidade * item.preco), 0) || 0;
                
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 1;
                ctx.strokeRect(margin, y, canvas.width - 2 * margin, 60);
                
                ctx.font = '12px Arial';
                ctx.fillText(`Subtotal: R$ ${this.formatarMoeda(subtotal)}`, margin + 10, y + 20);
                
                if (this.vendaAtual?.discount?.value > 0) {
                    const desconto = this.vendaAtual.discount.type === 'percent' 
                        ? (subtotal * this.vendaAtual.discount.value) / 100 
                        : this.vendaAtual.discount.value;
                    ctx.fillText(`Desconto: -R$ ${this.formatarMoeda(desconto)}`, margin + 10, y + 35);
                }
                
                ctx.font = 'bold 14px Arial';
                ctx.fillStyle = '#10b981';
                ctx.fillText(`TOTAL: R$ ${this.formatarMoeda(this.vendaAtual?.total || 0)}`, margin + 10, y + 50);
                
                y += 80;
                
                // ========== RODAPÉ ==========
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('✅ PAGAMENTO APROVADO!', centerX, y);
                y += 20;
                
                ctx.fillStyle = '#666666';
                ctx.font = '10px Arial';
                ctx.fillText('Obrigado pela preferência!', centerX, y);
                y += 15;
                ctx.fillText(`${this.dadosEmpresa.telefone} | ${this.dadosEmpresa.email}`, centerX, y);
                y += 15;
                ctx.fillText(`Gerado em: ${dataHora}`, centerX, y);
                
                // Converter para base64
                const base64 = canvas.toDataURL('image/png');
                resolve(base64);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // ========== BAIXAR IMAGEM ==========
    baixarImagem(base64) {
        try {
            const link = document.createElement('a');
            link.href = base64;
            link.download = `Comprovante_Venda_${this.vendaAtual?.vendaId || Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erro ao baixar imagem:', error);
        }
    }

    // ========== EMAIL COM PDF ==========
    async enviarEmail() {
        const btn = document.getElementById('emailBtn');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Gerando PDF<span class="loading-dots"><span></span><span></span><span></span></span>
            `;
            btn.disabled = true;

            const doc = await this.gerarPDF();
            
            // Baixar PDF
            const nomeArquivo = `Cupom_Venda_${this.vendaAtual?.vendaId || Date.now()}.pdf`;
            doc.save(nomeArquivo);

            // Criar email
            const assunto = `Cupom Não Fiscal - Venda #${this.vendaAtual?.vendaId || 'N/A'} - ${this.dadosEmpresa.nome}`;
            const corpo = `${this.dadosEmpresa.nome}\n${this.dadosEmpresa.endereco}\n${this.dadosEmpresa.cidade}\nTel: ${this.dadosEmpresa.telefone} | Email: ${this.dadosEmpresa.email}\nCNPJ: ${this.dadosEmpresa.cnpj}\n\nCUPOM NÃO FISCAL\n${'='.repeat(50)}\n\nVenda #: ${this.vendaAtual?.vendaId || 'N/A'}\nCliente: ${this.vendaAtual?.cliente || 'Cliente não informado'}\nTotal: R$ ${this.formatarMoeda(this.vendaAtual?.total || 0)}\nPagamento: ${this.formatarFormaPagamento(this.vendaAtual?.paymentMethod, this.vendaAtual?.paymentDetails)}\n\nPagamento Aprovado!\nObrigado pela preferência!\n\nVeja o cupom completo no arquivo PDF anexo.\n\nDocumento gerado automaticamente pelo SmartBiz POS`;
            
            const mailtoURL = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
            
            window.location.href = mailtoURL;
            
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Email Aberto!
            `;
            
            this.showToast(`📧 Cliente de email aberto!\n📎 Anexe o PDF "${nomeArquivo}" no email`, 'success');

        } catch (error) {
            console.error('Erro email:', error);
            this.showToast('❌ Erro ao gerar PDF para email', 'error');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    }

    novaVenda() {
        this.fechar();
        
        // Chamar função de nova venda do sistema principal
        if (window.vendasSystemInstance) {
            window.vendasSystemInstance.clear();
        } else if (window.VendasSystem && window.VendasSystem.clearSale) {
            window.VendasSystem.clearSale();
        }
        
        this.showToast('🛒 Nova venda iniciada!', 'info');
    }

    fechar() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    showToast(message, type = 'info') {
        // Usar sistema de toast existente se disponível
        if (window.VendasSystem && window.VendasSystem.showToast) {
            window.VendasSystem.showToast(message, type);
        } else {
            // Toast simples próprio
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10001;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white; padding: 12px 16px; border-radius: 8px; font-weight: 500;
                transform: translateX(100%); transition: all 0.3s ease; max-width: 300px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25); white-space: pre-line;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }
    }
}

// ========== INICIALIZAÇÃO E API PÚBLICA ==========
let vendaFinalizadaModal;

document.addEventListener('DOMContentLoaded', () => {
    vendaFinalizadaModal = new VendaFinalizadaModal();
});

// API Global
window.VendaFinalizadaModal = {
    show: (dadosVenda) => {
        if (!vendaFinalizadaModal) {
            vendaFinalizadaModal = new VendaFinalizadaModal();
        }
        vendaFinalizadaModal.show(dadosVenda);
    },
    fechar: () => vendaFinalizadaModal?.fechar(),
    
    // Configurar dados da empresa
    configurarEmpresa: (dadosEmpresa) => {
        if (vendaFinalizadaModal) {
            vendaFinalizadaModal.dadosEmpresa = { ...vendaFinalizadaModal.dadosEmpresa, ...dadosEmpresa };
        }
    }
};

console.log('🎊 Modal de Venda Finalizada Melhorado carregado!');