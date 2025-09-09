// ===== CREDIÁRIO - MODAIS E FUNCIONALIDADES AVANÇADAS =====

// Variáveis globais para os modais
let currentPaymentData = null;
let currentWhatsAppData = null;

// ===== MODAL DE PAGAMENTO =====
async function openPaymentModal(crediariaId) {
    try {
        // Buscar dados da parcela
        const item = crediariosData.find(c => c.id == crediariaId);
        if (!item) {
            showNotification('Parcela não encontrada', 'error');
            return;
        }
        
        currentPaymentData = {
            id: item.id,
            cliente: item.cliente?.nome || 'Cliente não encontrado',
            venda: item.venda_id,
            parcela: item.numero_parcela,
            valorParcela: item.valor_parcela,
            valorPago: item.valor_pago || 0,
            saldoRestante: item.saldo_restante
        };
        
        // Preencher modal
        document.getElementById('payment-cliente').textContent = currentPaymentData.cliente;
        document.getElementById('payment-venda').textContent = `#${currentPaymentData.venda}`;
        document.getElementById('payment-parcela').textContent = currentPaymentData.parcela;
        document.getElementById('payment-valor-parcela').textContent = formatCurrency(currentPaymentData.valorParcela);
        document.getElementById('payment-valor-pago').textContent = formatCurrency(currentPaymentData.valorPago);
        document.getElementById('payment-saldo-restante').textContent = formatCurrency(currentPaymentData.saldoRestante);
        
        // Configurar campos
        document.getElementById('payment-valor').value = currentPaymentData.saldoRestante.toFixed(2);
        document.getElementById('payment-valor').max = currentPaymentData.saldoRestante;
        
        // Configurar data atual no fuso horário brasileiro
        const now = new Date();
        const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        document.getElementById('payment-data').value = brazilTime.toISOString().split('T')[0];
        document.getElementById('payment-observacoes').value = '';
        
        // Configurar eventos do modal
        setupPaymentModalEvents();
        
        // Mostrar modal
        const modal = document.getElementById('payment-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Erro ao abrir modal de pagamento:', error);
        showNotification('Erro ao abrir modal de pagamento', 'error');
    }
}

function setupPaymentModalEvents() {
    // Remover eventos existentes
    const confirmBtn = document.getElementById('confirm-payment');
    const cancelBtn = document.getElementById('cancel-payment');
    
    // Clonar e substituir para remover eventos existentes
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Adicionar novos eventos
    newConfirmBtn.addEventListener('click', confirmPayment);
    newCancelBtn.addEventListener('click', closePaymentModal);
}

async function confirmPayment() {
    if (!currentPaymentData) return;
    
    const valor = parseFloat(document.getElementById('payment-valor').value);
    const data = document.getElementById('payment-data').value;
    const forma = document.getElementById('payment-forma').value;
    const observacoes = document.getElementById('payment-observacoes').value;
    
    // Validações
    if (!valor || valor <= 0) {
        showNotification('Informe um valor válido para o pagamento', 'error');
        return;
    }
    
    if (valor > currentPaymentData.saldoRestante) {
        showNotification(`O valor não pode ser maior que ${formatCurrency(currentPaymentData.saldoRestante)}`, 'error');
        return;
    }
    
    if (!data) {
        showNotification('Informe a data do pagamento', 'error');
        return;
    }
    
    try {
        // Calcular novo valor pago e status
        const novoValorPago = currentPaymentData.valorPago + valor;
        let novoStatus = 'pendente';
        
        if (novoValorPago >= currentPaymentData.valorParcela) {
            novoStatus = 'pago';
        } else if (novoValorPago > 0) {
            novoStatus = 'parcial';
        }
        
        // Converter data para horário brasileiro antes de salvar
        const paymentDate = new Date(data + 'T00:00:00');
        const brazilPaymentTime = new Date(paymentDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        const brazilDateString = brazilPaymentTime.toISOString().split('T')[0];
        
        // Atualizar na tabela crediario
        const { error: updateError } = await supabaseClient
            .from('crediario')
            .update({
                valor_pago: novoValorPago,
                data_pagamento: brazilDateString,
                status: novoStatus,
                observacoes: observacoes || null
            })
            .eq('id', currentPaymentData.id);
        
        if (updateError) throw updateError;
        
        // Registrar na movimentação financeira
        await registrarMovimentacaoFinanceira(valor, data, forma, observacoes);
        
        showNotification('Pagamento registrado com sucesso!', 'success');
        closePaymentModal();
        loadCrediariosData(); // Recarregar dados
        
    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        showNotification('Erro ao registrar pagamento', 'error');
    }
}

async function registrarMovimentacaoFinanceira(valor, data, forma, observacoes) {
    try {
        const descricao = `Recebimento Crediário - Venda #${currentPaymentData.venda} - Parcela ${currentPaymentData.parcela}`;
        
        // Converter data para horário brasileiro
        const paymentDate = new Date(data + 'T00:00:00');
        const brazilPaymentTime = new Date(paymentDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        const brazilDateString = brazilPaymentTime.toISOString().split('T')[0];
        
        const movimentacao = {
            id_empresa: String(window.currentCompanyId),
            tipo: 'RECEBER',
            descricao: descricao,
            valor: valor,
            data_vencimento: brazilDateString,
            categoria: 'Crediário',
            pessoa_empresa: currentPaymentData.cliente,
            documento: `${currentPaymentData.venda}-P${currentPaymentData.parcela}`,
            observacoes: observacoes || `Pagamento via ${forma}`,
            recorrente: false,
            status: 'PAGO',
            auth_user_id: window.currentUser?.auth_user_id || null
        };
        
        await supabaseClient
            .from('movimentacoes_financeiras')
            .insert([movimentacao]);
            
    } catch (error) {
        console.error('Erro ao registrar movimentação financeira:', error);
        // Não falha o pagamento por causa disso
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
        currentPaymentData = null;
    }, 300);
}

// ===== MODAL WHATSAPP =====
async function openWhatsAppModal(clienteId, vendaId) {
    try {
        // Buscar dados do cliente
        const { data: cliente, error } = await supabaseClient
            .from('clientes')
            .select('*')
            .eq('id', clienteId)
            .single();
        
        if (error) throw error;
        
        if (!cliente.telefone) {
            showNotification('Cliente não possui telefone cadastrado', 'warning');
            return;
        }
        
        // Buscar parcelas em aberto desta venda
        const parcelasVenda = crediariosData.filter(c => 
            c.cliente_id == clienteId && c.venda_id === vendaId && c.saldo_restante > 0
        );
        
        currentWhatsAppData = {
            cliente: cliente,
            vendaId: vendaId,
            parcelas: parcelasVenda
        };
        
        // Preencher modal
        document.getElementById('whatsapp-cliente').textContent = cliente.nome;
        document.getElementById('whatsapp-telefone').textContent = cliente.telefone;
        
        // Configurar eventos do modal
        setupWhatsAppModalEvents();
        
        // Gerar mensagem
        updateWhatsAppMessage();
        
        // Mostrar modal
        const modal = document.getElementById('whatsapp-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Erro ao abrir modal WhatsApp:', error);
        showNotification('Erro ao carregar dados do cliente', 'error');
    }
}

function setupWhatsAppModalEvents() {
    // Remover eventos existentes
    const templateSelect = document.getElementById('whatsapp-template');
    const sendBtn = document.getElementById('send-whatsapp');
    const cancelBtn = document.getElementById('cancel-whatsapp');
    
    // Clonar e substituir para remover eventos existentes
    const newTemplateSelect = templateSelect.cloneNode(true);
    const newSendBtn = sendBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    templateSelect.parentNode.replaceChild(newTemplateSelect, templateSelect);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Adicionar novos eventos
    newTemplateSelect.addEventListener('change', updateWhatsAppMessage);
    newSendBtn.addEventListener('click', sendWhatsApp);
    newCancelBtn.addEventListener('click', closeWhatsAppModal);
}

async function updateWhatsAppMessage() {
    if (!currentWhatsAppData) return;
    
    const template = document.getElementById('whatsapp-template').value;
    const { cliente, vendaId, parcelas } = currentWhatsAppData;
    
    const parcelasVencidas = parcelas.filter(p => p.is_overdue);
    const parcelasHoje = parcelas.filter(p => p.is_due_today);
    const proximasParcelas = parcelas.filter(p => !p.is_overdue && !p.is_due_today).slice(0, 3);
    
    const totalAberto = parcelas.reduce((sum, p) => sum + p.saldo_restante, 0);
    
    // Calcular maior tempo de atraso
    let maiorAtraso = 0;
    if (parcelasVencidas.length > 0) {
        maiorAtraso = Math.max(...parcelasVencidas.map(p => 
            Math.floor((new Date() - new Date(p.data_vencimento)) / (1000 * 60 * 60 * 24))
        ));
    }
    
    // Buscar produtos da venda
    let produtosVenda = [];
    try {
        const { data: vendaData, error } = await supabaseClient
            .from('vendas')
            .select('produto_nome, quantidade_unit, preco_unitario')
            .eq('id_venda', vendaId)
            .eq('id_empresa', window.currentCompanyId);
        
        if (!error && vendaData) {
            produtosVenda = vendaData;
        }
    } catch (error) {
        console.warn('Erro ao buscar produtos da venda:', error);
    }
    
    let mensagem = '';
    
    // Recuperar mensagens personalizadas do localStorage
    const savedMessages = loadSavedMessages();
    
    // Determinar template automático baseado no tempo de atraso
    let templateFinal = template;
    if (template === 'automatico') {
        if (maiorAtraso === 0 && parcelasHoje.length > 0) {
            templateFinal = 'cordial'; // Vence hoje
        } else if (maiorAtraso >= 1 && maiorAtraso <= 7) {
            templateFinal = 'profissional'; // 1-7 dias de atraso
        } else if (maiorAtraso >= 8 && maiorAtraso <= 15) {
            templateFinal = 'urgente'; // 8-15 dias de atraso
        } else if (maiorAtraso > 15) {
            templateFinal = 'critico'; // Mais de 15 dias
        } else {
            templateFinal = 'cordial'; // Sem atraso
        }
    }
    
    // Cabeçalho da mensagem baseado no template e tempo de atraso
    switch (templateFinal) {
        case 'profissional':
            if (savedMessages.profissional) {
                mensagem = savedMessages.profissional;
            } else {
                mensagem = `Prezado(a) ${cliente.nome},\n\n`;
                mensagem += `Informamos sobre a situação do crediário referente à Venda #${vendaId}:\n\n`;
            }
            break;
            
        case 'cordial':
            if (savedMessages.cordial) {
                mensagem = savedMessages.cordial;
            } else {
                mensagem = `Olá ${cliente.nome}! 😊\n\n`;
                if (parcelasHoje.length > 0) {
                    mensagem += `Lembramos que você tem parcela(s) vencendo HOJE da Venda #${vendaId}:\n\n`;
                } else {
                    mensagem += `Esperamos que esteja tudo bem. Este é um lembrete sobre o crediário da Venda #${vendaId}:\n\n`;
                }
            }
            break;
            
        case 'urgente':
            if (savedMessages.urgente) {
                mensagem = savedMessages.urgente;
            } else {
                mensagem = `⚠️ ${cliente.nome}, ATENÇÃO NECESSÁRIA!\n\n`;
                mensagem += `Identificamos parcelas em atraso (${maiorAtraso} dias) da Venda #${vendaId} que necessitam regularização:\n\n`;
            }
            break;
            
        case 'critico':
            if (savedMessages.critico) {
                mensagem = savedMessages.critico;
            } else {
                mensagem = `🚨 ${cliente.nome} - SITUAÇÃO CRÍTICA! 🚨\n\n`;
                mensagem += `Parcelas com mais de 15 dias de atraso (${maiorAtraso} dias) da Venda #${vendaId}.\n`;
                mensagem += `REGULARIZAÇÃO IMEDIATA NECESSÁRIA:\n\n`;
            }
            break;
            
        case 'personalizada':
            if (savedMessages.personalizada) {
                mensagem = savedMessages.personalizada;
            } else {
                mensagem = `${cliente.nome},\n\n`;
                mensagem += `Sobre o crediário da Venda #${vendaId}:\n\n`;
            }
            break;
    }
    
    // Seção de produtos
    if (produtosVenda && produtosVenda.length > 0) {
        mensagem += `🛒 *PRODUTOS ADQUIRIDOS:*\n`;
        produtosVenda.forEach(produto => {
            mensagem += `• ${produto.produto_nome} - Qtd: ${produto.quantidade_unit} - ${formatCurrency(produto.preco_unitario)}\n`;
        });
        mensagem += `\n`;
    }
    
    // Detalhes das parcelas vencidas
    if (parcelasVencidas.length > 0) {
        mensagem += `🔴 *PARCELAS VENCIDAS:*\n`;
        parcelasVencidas.forEach(parcela => {
            mensagem += `• Parcela ${parcela.numero_parcela}: ${formatCurrency(parcela.saldo_restante)}\n`;
            mensagem += `📅 Venceu em: ${formatDate(parcela.data_vencimento)} (há ${Math.floor((new Date() - new Date(parcela.data_vencimento)) / (1000 * 60 * 60 * 24))} dias)\n`;
        });
        mensagem += `\n`;
    }
    
    // Detalhes das parcelas que vencem hoje
    if (parcelasHoje.length > 0) {
        mensagem += `⏰ *PARCELAS QUE VENCEM HOJE:*\n`;
        parcelasHoje.forEach(parcela => {
            mensagem += `• Parcela ${parcela.numero_parcela}: ${formatCurrency(parcela.saldo_restante)}\n`;
            mensagem += `📅 Vence hoje: ${formatDate(parcela.data_vencimento)}\n`;
        });
        mensagem += `\n`;
    }
    
    mensagem += `💰 *TOTAL:* ${formatCurrency(totalAberto)}\n\n`;
    
    // PIX compacto
    mensagem += `💳 *PIX:* [Sua Chave PIX]\n`;
    mensagem += `📱 Pague na hora! ✅ Confirmação automática\n\n`;
    
    // Finalização compacta baseada no template
    switch (templateFinal) {
        case 'profissional':
            mensagem += `Solicitamos regularização. Envie comprovante PIX.\n🏢 Equipe Financeira`;
            break;
            
        case 'cordial':
            mensagem += `😊 PIX é mais rápido! Obrigado pela confiança! 💙`;
            break;
            
        case 'urgente':
            mensagem += `⚠️ Regularize HOJE! PIX em segundos.`;
            break;
            
        case 'critico':
            mensagem += `🚨 PRAZO: 24h! PIX evita complicações.`;
            break;
            
        case 'personalizada':
            mensagem += `PIX recomendado. 🏢 Sua Empresa`;
            break;
    }
    
    document.getElementById('whatsapp-mensagem').value = mensagem;
    
    // Salvar mensagem automaticamente no localStorage para todos os templates
    saveCustomMessage(templateFinal, mensagem);
}

// Função para salvar mensagens personalizadas
function saveCustomMessage(template, message) {
    const savedMessages = JSON.parse(localStorage.getItem('whatsapp_templates') || '{}');
    savedMessages[template] = message;
    localStorage.setItem('whatsapp_templates', JSON.stringify(savedMessages));
}

// Função para carregar mensagens salvas
function loadSavedMessages() {
    return JSON.parse(localStorage.getItem('whatsapp_templates') || '{}');
}

function sendWhatsApp() {
    if (!currentWhatsAppData) return;
    
    const mensagem = document.getElementById('whatsapp-mensagem').value.trim();
    
    if (!mensagem) {
        showNotification('Digite uma mensagem para enviar', 'error');
        return;
    }
    
    // Limpar e formatar número
    let telefone = currentWhatsAppData.cliente.telefone.replace(/\D/g, '');
    
    // Adicionar código do país se necessário
    if (telefone.length === 11) {
        telefone = '55' + telefone;
    } else if (telefone.length === 10) {
        telefone = '55' + telefone;
    }
    
    // Codificar mensagem
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Abrir WhatsApp
    const url = `https://wa.me/${telefone}?text=${mensagemCodificada}`;
    window.open(url, '_blank');
    
    showNotification('WhatsApp aberto! Envie a mensagem pelo aplicativo.', 'success');
    closeWhatsAppModal();
}

function closeWhatsAppModal() {
    const modal = document.getElementById('whatsapp-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
        currentWhatsAppData = null;
    }, 300);
}

// ===== MODAL DE HISTÓRICO =====
async function openHistoryModal(crediariaId) {
    try {
        // Buscar dados da parcela
        const item = crediariosData.find(c => c.id == crediariaId);
        if (!item) {
            showNotification('Parcela não encontrada', 'error');
            return;
        }
        
        // Preencher informações
        document.getElementById('history-cliente').textContent = item.cliente?.nome || 'Cliente não encontrado';
        document.getElementById('history-venda').textContent = `#${item.venda_id}`;
        document.getElementById('history-parcela').textContent = item.numero_parcela;
        
        // Configurar eventos do modal
        setupHistoryModalEvents();
        
        // Renderizar histórico
        const historyContent = document.getElementById('history-content');
        
        if (!item.data_pagamento) {
            historyContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Nenhum pagamento registrado</h3>
                    <p>Esta parcela ainda não possui histórico de pagamentos.</p>
                </div>
            `;
        } else {
            historyContent.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div class="timeline-date">${formatDate(item.data_pagamento)}</div>
                            <div class="timeline-amount">${formatCurrency(item.valor_pago)}</div>
                        </div>
                        <div class="timeline-details">
                            <strong>Status:</strong> ${getStatusLabel(item.status_calculado)}<br>
                            ${item.observacoes ? `<strong>Observações:</strong> ${item.observacoes}<br>` : ''}
                            <strong>Última atualização:</strong> ${formatDateTime(item.created_at)}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Mostrar modal
        const modal = document.getElementById('history-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        showNotification('Erro ao carregar histórico', 'error');
    }
}

function setupHistoryModalEvents() {
    // Remover eventos existentes
    const closeBtn = document.getElementById('close-history');
    
    // Clonar e substituir para remover eventos existentes
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    // Adicionar novos eventos
    newCloseBtn.addEventListener('click', closeHistoryModal);
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// ===== COBRANÇA EM LOTE =====
async function bulkCharge() {
    try {
        const clientesVencidos = {};
        
        // Agrupar parcelas vencidas por cliente
        crediariosData.forEach(item => {
            if (item.is_overdue && item.saldo_restante > 0 && item.cliente?.telefone) {
                const clienteId = item.cliente_id;
                if (!clientesVencidos[clienteId]) {
                    clientesVencidos[clienteId] = {
                        cliente: item.cliente,
                        parcelas: []
                    };
                }
                clientesVencidos[clienteId].parcelas.push(item);
            }
        });
        
        const clientesCount = Object.keys(clientesVencidos).length;
        
        if (clientesCount === 0) {
            showNotification('Não há clientes com parcelas vencidas e telefone cadastrado', 'warning');
            return;
        }
        
        const confirmacao = confirm(
            `Deseja enviar cobrança via WhatsApp para ${clientesCount} cliente(s) com parcelas vencidas?`
        );
        
        if (!confirmacao) return;
        
        // Abrir WhatsApp para cada cliente (com delay)
        let index = 0;
        for (const clienteId in clientesVencidos) {
            const clienteData = clientesVencidos[clienteId];
            const primeiraVenda = clienteData.parcelas[0].venda_id;
            
            setTimeout(() => {
                openWhatsAppModal(clienteId, primeiraVenda);
            }, index * 1500); // Delay de 1.5 segundos
            
            index++;
        }
        
        showNotification(`Preparando cobrança para ${clientesCount} cliente(s)`, 'info');
        
    } catch (error) {
        console.error('Erro na cobrança em lote:', error);
        showNotification('Erro ao processar cobrança em lote', 'error');
    }
}

// ===== FUNÇÕES AUXILIARES PARA MODAIS =====
function resetModalForms() {
    // Reset do modal de pagamento
    const paymentForm = document.querySelector('#payment-modal form');
    if (paymentForm) {
        paymentForm.reset();
    }
    
    // Reset dos campos específicos
    const valorInput = document.getElementById('payment-valor');
    const dataInput = document.getElementById('payment-data');
    const obsInput = document.getElementById('payment-observacoes');
    
    if (valorInput) valorInput.value = '';
    if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];
    if (obsInput) obsInput.value = '';
    
    // Reset do modal WhatsApp
    const templateSelect = document.getElementById('whatsapp-template');
    const mensagemTextarea = document.getElementById('whatsapp-mensagem');
    
    if (templateSelect) templateSelect.value = 'profissional';
    if (mensagemTextarea) mensagemTextarea.value = '';
}

function validatePaymentForm() {
    const valor = parseFloat(document.getElementById('payment-valor').value);
    const data = document.getElementById('payment-data').value;
    
    const errors = [];
    
    if (!valor || valor <= 0) {
        errors.push('Valor do pagamento é obrigatório e deve ser maior que zero');
    }
    
    if (!data) {
        errors.push('Data do pagamento é obrigatória');
    }
    
    if (currentPaymentData && valor > currentPaymentData.saldoRestante) {
        errors.push(`Valor não pode ser maior que ${formatCurrency(currentPaymentData.saldoRestante)}`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona código do país se necessário
    if (cleaned.length === 10 || cleaned.length === 11) {
        cleaned = '55' + cleaned;
    }
    
    return cleaned;
}

function generateWhatsAppURL(phone, message) {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// ===== TRATAMENTO DE ERROS DOS MODAIS =====
function handleModalError(error, context) {
    console.error(`Erro no modal ${context}:`, error);
    
    let userMessage = 'Ocorreu um erro inesperado';
    
    switch (context) {
        case 'payment':
            userMessage = 'Erro ao processar pagamento';
            break;
        case 'whatsapp':
            userMessage = 'Erro ao preparar mensagem WhatsApp';
            break;
        case 'history':
            userMessage = 'Erro ao carregar histórico';
            break;
        case 'bulk':
            userMessage = 'Erro na cobrança em lote';
            break;
    }
    
    showNotification(userMessage, 'error');
}

// ===== VALIDAÇÕES ESPECÍFICAS =====
function validateWhatsAppData() {
    if (!currentWhatsAppData) {
        return { isValid: false, error: 'Dados do cliente não encontrados' };
    }
    
    if (!currentWhatsAppData.cliente.telefone) {
        return { isValid: false, error: 'Cliente não possui telefone cadastrado' };
    }
    
    const mensagem = document.getElementById('whatsapp-mensagem').value.trim();
    if (!mensagem) {
        return { isValid: false, error: 'Mensagem não pode estar vazia' };
    }
    
    return { isValid: true };
}

function validatePaymentData() {
    if (!currentPaymentData) {
        return { isValid: false, error: 'Dados da parcela não encontrados' };
    }
    
    const formValidation = validatePaymentForm();
    return formValidation;
}

// ===== DEBUG E LOGS =====
function logModalAction(action, data = {}) {
    console.log(`[MODAL] ${action}:`, {
        timestamp: new Date().toISOString(),
        ...data
    });
}

// Exportar funções para debug (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugModals = {
        currentPaymentData,
        currentWhatsAppData,
        validatePaymentForm,
        validateWhatsAppData,
        formatPhoneNumber,
        generateWhatsAppURL
    };
}

// Exportar funções globais para uso nos templates HTML
window.openPaymentModal = openPaymentModal;
window.openWhatsAppModal = openWhatsAppModal;
window.openHistoryModal = openHistoryModal;

console.log('✅ Sistema de Crediário inicializado - Arquivo de Modais');