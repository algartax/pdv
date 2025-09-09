// ===== MODAL DE WHATSAPP - GESTÃO DE CLIENTES =====

class WhatsAppModal {
    constructor() {
        this.modal = null;
        this.currentClient = null;
        this.currentMessage = '';
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="whatsapp-modal" class="whatsapp-modal-overlay" style="display: none;">
                <div class="whatsapp-modal-container">
                    <div class="whatsapp-modal-header">
                        <div class="whatsapp-header-info">
                            <div class="whatsapp-icon">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="whatsapp-title">
                                <h3>Enviar WhatsApp</h3>
                                <p id="whatsapp-client-info">Selecione uma mensagem</p>
                            </div>
                        </div>
                        <button class="whatsapp-close-btn" id="close-whatsapp-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="whatsapp-modal-body">
                        <!-- Informações do Cliente -->
                        <div class="client-info-section">
                            <div class="client-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="client-details">
                                <h4 id="modal-client-name">Nome do Cliente</h4>
                                <p id="modal-client-phone">Telefone</p>
                                <p id="modal-client-status">Status do Cliente</p>
                            </div>
                        </div>

                        <!-- Tipos de Mensagem -->
                        <div class="message-types">
                            <h5>Selecione o tipo de mensagem:</h5>
                            <div class="message-type-buttons">
                                <button class="message-type-btn active" data-type="boas-vindas">
                                    <i class="fas fa-heart"></i>
                                    <span>Boas Vindas</span>
                                </button>
                                <button class="message-type-btn" data-type="promocao">
                                    <i class="fas fa-percent"></i>
                                    <span>Promoção</span>
                                </button>
                                <button class="message-type-btn" data-type="aniversario">
                                    <i class="fas fa-birthday-cake"></i>
                                    <span>Aniversário</span>
                                </button>
                                <button class="message-type-btn" data-type="recompra">
                                    <i class="fas fa-refresh"></i>
                                    <span>Lembrete Recompra</span>
                                </button>
                                <button class="message-type-btn" data-type="personalizada">
                                    <i class="fas fa-edit"></i>
                                    <span>Personalizada</span>
                                </button>
                            </div>
                        </div>

                        <!-- Preview da Mensagem -->
                        <div class="message-preview">
                            <h5>Preview da mensagem:</h5>
                            <div class="whatsapp-chat-preview">
                                <div class="chat-bubble">
                                    <div id="message-preview-text">Selecione um tipo de mensagem acima</div>
                                    <div class="chat-time">agora</div>
                                </div>
                            </div>
                        </div>

                        <!-- Área de Edição (para mensagem personalizada) -->
                        <div class="message-editor" id="message-editor" style="display: none;">
                            <h5>Editar mensagem:</h5>
                            <textarea id="custom-message" placeholder="Digite sua mensagem personalizada aqui..."></textarea>
                            <div class="message-tools">
                                <button class="tool-btn" onclick="insertEmoji('😊')">😊</button>
                                <button class="tool-btn" onclick="insertEmoji('🎉')">🎉</button>
                                <button class="tool-btn" onclick="insertEmoji('💝')">💝</button>
                                <button class="tool-btn" onclick="insertEmoji('🛍️')">🛍️</button>
                                <span class="char-count">0/1000</span>
                            </div>
                        </div>
                    </div>

                    <div class="whatsapp-modal-footer">
                        <button class="btn-cancel" id="cancel-whatsapp">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button class="btn-send-whatsapp" id="send-whatsapp-message">
                            <i class="fab fa-whatsapp"></i>
                            Enviar WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('whatsapp-modal');
    }

    setupEventListeners() {
        // Fechar modal
        document.getElementById('close-whatsapp-modal').addEventListener('click', () => this.close());
        document.getElementById('cancel-whatsapp').addEventListener('click', () => this.close());

        // Fechar ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Tipos de mensagem
        document.querySelectorAll('.message-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.message-type-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.message-type-btn').classList.add('active');
                this.updateMessagePreview(e.target.closest('.message-type-btn').dataset.type);
            });
        });

        // Enviar mensagem
        document.getElementById('send-whatsapp-message').addEventListener('click', () => this.sendMessage());

        // Editor personalizado
        document.getElementById('custom-message').addEventListener('input', (e) => {
            this.updateCharCount();
            this.updateCustomPreview(e.target.value);
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    open(clientData, messageType = 'boas-vindas', customData = {}) {
        this.currentClient = clientData;
        
        // Atualizar informações do cliente
        document.getElementById('modal-client-name').textContent = clientData.nome;
        document.getElementById('modal-client-phone').textContent = this.formatPhone(clientData.telefone);
        document.getElementById('modal-client-status').textContent = clientData.tipo_cliente_display || 'Cliente';
        document.getElementById('whatsapp-client-info').textContent = `Para: ${clientData.nome}`;

        // Selecionar tipo de mensagem
        document.querySelectorAll('.message-type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${messageType}"]`)?.classList.add('active');

        // Atualizar preview
        this.updateMessagePreview(messageType, customData);

        // Mostrar modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.currentClient = null;
        this.currentMessage = '';
        
        // Resetar form
        document.getElementById('custom-message').value = '';
        document.getElementById('message-editor').style.display = 'none';
    }

    updateMessagePreview(type, customData = {}) {
        const messages = this.getMessageTemplates(type, customData);
        const preview = document.getElementById('message-preview-text');
        const editor = document.getElementById('message-editor');

        if (type === 'personalizada') {
            editor.style.display = 'block';
            preview.textContent = 'Digite sua mensagem personalizada abaixo';
        } else {
            editor.style.display = 'none';
            this.currentMessage = messages[type] || messages.default;
            preview.innerHTML = this.formatMessagePreview(this.currentMessage);
        }
    }

    updateCustomPreview(message) {
        const preview = document.getElementById('message-preview-text');
        this.currentMessage = message;
        preview.innerHTML = this.formatMessagePreview(message) || 'Digite sua mensagem...';
    }

    updateCharCount() {
        const textarea = document.getElementById('custom-message');
        const counter = document.querySelector('.char-count');
        const count = textarea.value.length;
        counter.textContent = `${count}/1000`;
        
        if (count > 1000) {
            counter.style.color = '#f44336';
            textarea.value = textarea.value.substring(0, 1000);
        } else {
            counter.style.color = '#666';
        }
    }

    getMessageTemplates(type, customData = {}) {
        const clientName = this.currentClient?.nome || 'Cliente';
        const productName = customData.produto || '';
        const frequency = customData.frequencia || '';
        
        return {
            'boas-vindas': `Olá ${clientName}! 🌟

Que bom ter você como nosso cliente! Esperamos que tenha gostado da sua experiência conosco.

Temos sempre novidades e promoções especiais. Que tal dar uma olhada no que temos de novo?

Estamos aqui para qualquer dúvida! 😊

Abraços! 🤗`,

            'promocao': `Olá ${clientName}! 🎉

Temos uma promoção especial que achamos que você vai adorar! 

Como um dos nossos clientes especiais, você tem acesso a descontos exclusivos em nossos produtos.

Venha conferir nossas ofertas imperdíveis! 🛍️

Aguardamos sua visita! ✨`,

            'aniversario': `🎉 PARABÉNS, ${clientName}! 🎂

Hoje é seu dia especial e não poderíamos deixar passar em branco!

Desejamos um dia repleto de alegrias e um ano cheio de realizações! 

Como presente, preparamos uma surpresa especial para você! 🎁

Muito obrigado por ser nosso cliente especial! 💝`,

            'recompra': `Olá ${clientName}! 😊

Como você está? Espero que esteja tudo bem!

${productName ? `Notei que já faz um tempo desde sua última compra do *${productName}*.` : 'Notei que já faz um tempo desde sua última compra.'}

${frequency ? `Considerando a frequência de uso de *${frequency}*, imagino que você já deve estar precisando repor! 🔄` : 'Que tal dar uma passadinha para repor seus produtos favoritos?'}

Temos sempre novidades e promoções especiais para nossos clientes fiéis como você! 

Qualquer dúvida, estou aqui para ajudar! 💬

Abraços! 🤗`,

            'default': `Olá ${clientName}! 

Esperamos que esteja tudo bem! 

Temos novidades incríveis que achamos que você vai gostar. Que tal dar uma passadinha para conhecer?

Estamos sempre aqui para atendê-lo da melhor forma!

Abraços! 😊`
        };
    }

    formatMessagePreview(message) {
        return message
            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    formatPhone(phone) {
        if (!phone) return 'Telefone não informado';
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.substring(0,2)}) ${clean.substring(2,7)}-${clean.substring(7)}`;
        }
        return phone;
    }

    sendMessage() {
        if (!this.currentClient || !this.currentClient.telefone) {
            showNotification('Cliente não possui telefone cadastrado', 'error');
            return;
        }

        const activeType = document.querySelector('.message-type-btn.active')?.dataset.type;
        
        if (activeType === 'personalizada') {
            const customMessage = document.getElementById('custom-message').value.trim();
            if (!customMessage) {
                showNotification('Digite uma mensagem personalizada', 'warning');
                return;
            }
            this.currentMessage = customMessage;
        }

        if (!this.currentMessage) {
            showNotification('Selecione um tipo de mensagem', 'warning');
            return;
        }

        // Limpar e formatar telefone
        const cleanPhone = this.currentClient.telefone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            showNotification('Número de telefone inválido', 'error');
            return;
        }

        const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
        const encodedMessage = encodeURIComponent(this.currentMessage);
        const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Feedback e fechar modal
        showNotification(`Mensagem enviada para ${this.currentClient.nome}`, 'success');
        this.close();
    }
}

// Funções utilitárias
function insertEmoji(emoji) {
    const textarea = document.getElementById('custom-message');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    textarea.value = text.substring(0, start) + emoji + text.substring(end);
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    textarea.focus();
    
    // Trigger input event para atualizar preview
    textarea.dispatchEvent(new Event('input'));
}

// Instância global
window.whatsAppModal = new WhatsAppModal();

// Funções de conveniência para usar em toda a aplicação
window.openWhatsAppModal = function(clientData, messageType = 'boas-vindas', customData = {}) {
    window.whatsAppModal.open(clientData, messageType, customData);
};

window.sendBirthdayWhatsApp = function(clientData) {
    window.whatsAppModal.open(clientData, 'aniversario');
};

window.sendRecompraWhatsApp = function(clientData, produto, frequencia) {
    window.whatsAppModal.open(clientData, 'recompra', { produto, frequencia });
};

window.sendPromocaoWhatsApp = function(clientData) {
    window.whatsAppModal.open(clientData, 'promocao');
};

console.log('📱 Modal de WhatsApp carregado');