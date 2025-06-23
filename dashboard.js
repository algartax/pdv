// ========== DASHBOARD SYSTEM ==========

class DashboardSystem {
    constructor() {
        this.stats = {
            vendas: 8473.50,
            pedidos: 34,
            produtos: 567,
            clientes: 129
        };
        this.init();
    }

    init() {
        console.log('📊 Inicializando Dashboard...');
        this.updateStats();
        this.setupEventListeners();
        this.checkUserAccess();
    }

    // ========== VERIFICAR ACESSO ==========
    checkUserAccess() {
        // Verificar se usuário está logado via localStorage ou HeaderSystem
        const userData = localStorage.getItem('smartbiz_user');
        if (!userData && !window.HeaderSystem?.getCurrentUser()) {
            console.log('❌ Usuário não autenticado');
            window.location.href = 'index.html';
            return;
        }
        console.log('✅ Usuário autenticado no dashboard');
    }

    // ========== ATUALIZAR ESTATÍSTICAS ==========
    updateStats() {
        // Simular dados dinâmicos (em produção viria do Supabase)
        this.stats.vendas += Math.random() * 100;
        this.stats.pedidos += Math.floor(Math.random() * 3);
        
        // Atualizar valores na interface
        const statElements = {
            vendas: document.querySelector('[data-stat="vendas"] .stat-value'),
            pedidos: document.querySelector('[data-stat="pedidos"] .stat-value'),
            produtos: document.querySelector('[data-stat="produtos"] .stat-value'),
            clientes: document.querySelector('[data-stat="clientes"] .stat-value')
        };

        // Formato para valores monetários
        if (statElements.vendas) {
            statElements.vendas.textContent = `R$ ${this.formatMoney(this.stats.vendas)}`;
        }
    }

    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
        // Cards de ação
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const action = card.dataset.action;
                this.handleAction(action);
            });
        });

        // Botão Nova Venda
        const newSaleBtn = document.getElementById('newSaleBtn');
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => {
                this.handleAction('vendas');
            });
        }

        // Stats cards clicáveis
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showToast('Abrindo detalhes...', 'info');
            });
        });

        console.log('🎯 Event listeners configurados');
    }

    // ========== AÇÕES ==========
    handleAction(action) {
        const actions = {
            vendas: () => {
                this.showToast('Abrindo sistema de vendas...', 'info');
                // Em produção: window.location.href = 'vendas.html';
            },
            cadastro: () => {
                this.showToast('Redirecionando para cadastro...', 'info');
                setTimeout(() => {
                    window.location.href = 'cadastro.html';
                }, 500);
            },
            qrcode: () => {
                this.showToast('Gerador de QR Code será implementado em breve', 'warning');
                // Em produção: abrir modal ou página de QR Code
            },
            estoque: () => {
                this.showToast('Sistema de estoque em desenvolvimento', 'info');
                // Em produção: window.location.href = 'estoque.html';
            },
            clientes: () => {
                this.showToast('Gerenciador de clientes em desenvolvimento', 'info');
                // Em produção: window.location.href = 'clientes.html';
            },
            relatorios: () => {
                this.showToast('Módulo de relatórios em desenvolvimento', 'info');
                // Em produção: window.location.href = 'relatorios.html';
            }
        };

        if (actions[action]) {
            console.log(`🔄 Executando ação: ${action}`);
            actions[action]();
        } else {
            this.showToast(`Ação "${action}" não encontrada`, 'error');
        }
    }

    // ========== UTILITÁRIOS ==========
    formatMoney(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    showToast(message, type = 'info') {
        // Usar sistema de toast do header se disponível
        if (window.HeaderSystem && window.HeaderSystem.showToast) {
            window.HeaderSystem.showToast(message, type);
        } else {
            // Fallback para console se header não estiver carregado
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // ========== DADOS SIMULADOS ==========
    async loadDashboardData() {
        // Em produção, aqui faria chamadas para o Supabase
        try {
            // Simular carregamento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Dados simulados que viriam do banco
            const data = {
                vendas_hoje: 8473.50,
                pedidos_hoje: 34,
                total_produtos: 567,
                total_clientes: 129,
                vendas_recentes: [
                    { id: 1, cliente: 'João Silva', valor: 127.50, data: new Date() },
                    { id: 2, cliente: 'Maria Santos', valor: 89.90, data: new Date() }
                ]
            };

            return data;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar dados do dashboard', 'error');
            return null;
        }
    }

    // ========== API PÚBLICA ==========
    refreshStats() {
        this.updateStats();
        this.showToast('Estatísticas atualizadas!', 'success');
    }

    getStats() {
        return this.stats;
    }
}

// ========== INICIALIZAÇÃO ==========
let dashboardSystem;

// Aguardar DOM e header carregarem
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que o header foi carregado
    setTimeout(() => {
        dashboardSystem = new DashboardSystem();
        
        // Exportar para uso global
        window.Dashboard = {
            refresh: () => dashboardSystem.refreshStats(),
            getStats: () => dashboardSystem.getStats(),
            showToast: (message, type) => dashboardSystem.showToast(message, type)
        };
        
        console.log('🚀 Dashboard System pronto!');
    }, 1000);
});

// ========== ATUALIZAÇÃO AUTOMÁTICA ==========
// Atualizar stats a cada 30 segundos (em produção)
setInterval(() => {
    if (dashboardSystem) {
        dashboardSystem.updateStats();
    }
}, 30000);