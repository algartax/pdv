// ========== HEADER SYSTEM COM DROPDOWNS MODERNOS ==========

class HeaderSystem {
    constructor() {
        this.dropdowns = this.initDropdowns();
        this.currentOpenDropdown = null;
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Header com Dropdowns...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    async start() {
        try {
            const timeout = setTimeout(() => {
                console.log('⏰ Carregamento forçado');
                this.loadFallback();
            }, 2000);

            const isAuthenticated = await this.checkAuth();
            
            if (isAuthenticated) {
                clearTimeout(timeout);
                this.showHeader();
            } else {
                this.redirectToLogin();
            }
        } catch (error) {
            console.error('❌ Erro:', error);
            this.redirectToLogin();
        }
    }

    // ========== CONFIGURAÇÃO DOS DROPDOWNS ==========
    initDropdowns() {
        return {
            home: {
                title: 'Home',
                subtitle: 'Página inicial',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>`,
                href: 'dashboard.html',
                isSimple: true
            },
            vendas: {
    title: 'Vendas',
    subtitle: 'Gestão de vendas e histórico',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 3h18M3 9h18M3 15h18M3 21h18"/>
    </svg>`,
    items: [
        {
            title: 'Nova Venda',
            subtitle: 'Registrar nova venda',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 5v14m-7-7h14"/>
            </svg>`,
            href: 'vendas.html'
        },
        {
            title: 'Venda Rápida',
            subtitle: 'Venda sem cadastro prévio',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M5 13l4 4L19 7"/>
            </svg>`,
            href: 'venda-rapida.html'
        },
        {
            title: 'Últimas Vendas',
            subtitle: 'Histórico de vendas recentes',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 17h16M4 13h16M4 9h16M4 5h16"/>
            </svg>`,
            href: 'ultimas_vendas.html'
        },
        {
            title: 'Orçamento',
            subtitle: 'Gerar orçamentos para clientes',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                <path d="M3 10h18"/>
                <path d="M7 14h.01M7 18h.01M11 14h2M11 18h2"/>
            </svg>`,
            href: 'orcamentos.html'
        }
    ]
},
            estoque: {
                title: 'Estoque',
                subtitle: 'Controle de produtos e inventário',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>`,
                items: [
                    {
                        title: 'Adicionar Produtos',
                        subtitle: 'Adicionar novos produtos',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 5v14m-7-7h14"/>
                        </svg>`,
                        href: 'cadastro_produto.html'
                    },
                    {
                        title: 'Lista de Produtos',
                        subtitle: 'Ver todos os produtos',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                        </svg>`,
                        href: 'lista-produtos.html'
                    }
                ]
            },
            cadastros: {
                title: 'Cadastros',
                subtitle: 'Gestão de dados do sistema',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>`,
                items: [
                    {
                        title: 'Cadastrar Categorias',
                        subtitle: 'Organizar produtos por categoria',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>`,
                        href: 'cadastro-categorias.html'
                    },
                    {
                        title: 'Cadastrar Clientes',
                        subtitle: 'Gerenciar base de clientes',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>`,
                        href: 'cadastro-clientes.html'
                    },
                    {
                        title: 'Cadastrar Funcionários',
                        subtitle: 'Gestão de equipe',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>`,
                        href: 'cadastro-funcionarios.html'
                    },
                    {
                        title: 'Máquinas de Cartão',
                        subtitle: 'Configurar pagamentos',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>`,
                        href: 'cadastro-maquinas.html'
                    },
                    {
                        title: 'Cadastrar Cores',
                        subtitle: 'Paleta de cores disponíveis',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>`,
                        href: 'cadastro-cores.html'
                    },
                    {
                        title: 'Cadastrar NCM',
                        subtitle: 'Códigos de classificação fiscal',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>`,
                        href: 'cadastro-ncm.html'
                    },
                    {
                        title: 'Cadastrar Fornecedores',
                        subtitle: 'Gestão de fornecedores',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"/>
                            <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
                        </svg>`,
                        href: 'cadastro-fornecedores.html'
                    },
                    {
                        title: 'Cadastrar Marcas',
                        subtitle: 'Marcas dos produtos',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>`,
                        href: 'cadastro-marcas.html'
                    }
                ]
            },
            relatorios: {
                title: 'Relatórios',
                subtitle: 'Análises e relatórios gerenciais',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>`,
                items: [
                    {
                        title: 'Dashboard',
                        subtitle: 'Visão geral do negócio',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>`,
                        href: 'dashboard.html'
                    },
                    {
                        title: 'Gráficos de Vendas',
                        subtitle: 'Análises visuais das vendas',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 18v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5M12 18v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9M20 18V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v9"/>
                        </svg>`,
                        href: 'graficos-vendas.html'
                    },
                    {
                        title: 'Gráficos de Estoque',
                        subtitle: 'Visualização do estoque',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17M9 10h6"/>
                        </svg>`,
                        href: 'grafico-estoque.html'
                    },
                    {
                        title: 'Baixar Excel',
                        subtitle: 'Exportar dados para planilha',
                        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>`,
                        href: 'export-excel.html'
                    }
                ]
            }

        };
    }

    // ========== AUTENTICAÇÃO ==========
    async checkAuth() {
        try {
            if (window.SmartBizAuth) {
                const session = await window.SmartBizAuth.checkSession();
                if (session?.user) {
                    this.loadUser(session.user);
                    return true;
                }
            }

            const userData = localStorage.getItem('smartbiz_user');
            if (userData) {
                this.loadUser(JSON.parse(userData));
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro na verificação:', error);
            return false;
        }
    }

    loadFallback() {
        const userData = localStorage.getItem('smartbiz_user');
        if (userData) {
            this.loadUser(JSON.parse(userData));
            this.showHeader();
        } else {
            this.loadUser({
                email: 'dev@smartbiz.com',
                name: 'Desenvolvedor'
            });
            this.showHeader();
            this.showToast('Modo desenvolvimento', 'warning');
        }
    }

    loadUser(user) {
        const name = user.user_metadata?.name || user.name || user.email?.split('@')[0] || 'Usuário';
        const email = user.email || 'usuario@exemplo.com';
        const initial = name.charAt(0).toUpperCase();

        const updates = {
            userName: name,
            dropdownName: name,
            dropdownEmail: email,
            userAvatar: initial,
            dropdownAvatar: initial
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('Avatar')) {
                    const avatarText = element.querySelector('.avatar-text') || element;
                    if (avatarText) avatarText.textContent = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        console.log('👤 Usuário carregado:', email);
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    // ========== MOSTRAR HEADER ==========
    showHeader() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');

        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        }
        
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }

        setTimeout(() => this.setupComponents(), 100);
        console.log('✅ Header carregado com Dropdowns!');
    }

    // ========== CONFIGURAR COMPONENTES ==========
    setupComponents() {
        this.setupNavigation();
        this.setupDropdowns();
        this.setupUserDropdown();
        this.setupInteractions();
    }

    setupNavigation() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.dataset.page;
            if (page === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    setupDropdowns() {
        // Criar HTML dos dropdowns
        this.createDropdownHTML();
        
        // Configurar eventos
        document.querySelectorAll('.nav-item.has-dropdown').forEach(navItem => {
            const dropdownId = navItem.dataset.dropdown;
            const dropdown = navItem.querySelector('.nav-dropdown');
            
            let hoverTimeout;
            
            // Mouse enter
            navItem.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                this.closeAllDropdowns();
                this.openDropdown(navItem, dropdown);
            });
            
            // Mouse leave
            navItem.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    this.closeDropdown(navItem, dropdown);
                }, 150);
            });
            
            // Prevenir fechamento quando mouse está no dropdown
            if (dropdown) {
                dropdown.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    this.closeDropdown(navItem, dropdown);
                });
            }
        });
        
        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item.has-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    createDropdownHTML() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Limpar navegação existente
        navMenu.innerHTML = '<div class="nav-indicator"></div>';

        // Criar itens com dropdowns ou links simples
        Object.entries(this.dropdowns).forEach(([key, config]) => {
            const navItem = document.createElement('a');
            
            if (config.isSimple) {
                // Botão simples sem dropdown
                navItem.className = 'nav-item';
                navItem.href = config.href;
                navItem.dataset.page = key;
                
                navItem.innerHTML = `
                    <div class="nav-icon">${config.icon}</div>
                    <span class="nav-text">${config.title}</span>
                `;
            } else {
                // Botão com dropdown
                navItem.className = 'nav-item has-dropdown';
                navItem.dataset.dropdown = key;
                navItem.dataset.page = key;
                
                navItem.innerHTML = `
                    <div class="nav-icon">${config.icon}</div>
                    <span class="nav-text">${config.title}</span>
                    <div class="nav-dropdown">
                        <div class="dropdown-header">
                            <div class="dropdown-title">
                                <div class="dropdown-title-icon">${config.icon}</div>
                                ${config.title}
                            </div>
                            <div class="dropdown-subtitle">${config.subtitle}</div>
                        </div>
                        <div class="dropdown-content">
                            ${config.items.map(item => `
                                <a href="${item.href}" class="dropdown-item">
                                    <div class="dropdown-item-icon">${item.icon}</div>
                                    <div class="dropdown-item-content">
                                        <div class="dropdown-item-title">${item.title}</div>
                                        <div class="dropdown-item-subtitle">${item.subtitle}</div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            navMenu.appendChild(navItem);
        });
    }

    openDropdown(navItem, dropdown) {
        navItem.classList.add('open');
        dropdown.classList.add('show');
        this.currentOpenDropdown = { navItem, dropdown };
    }

    closeDropdown(navItem, dropdown) {
        navItem.classList.remove('open');
        dropdown.classList.remove('show');
        if (this.currentOpenDropdown?.dropdown === dropdown) {
            this.currentOpenDropdown = null;
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
            item.classList.remove('open');
            const dropdown = item.querySelector('.nav-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        });
        this.currentOpenDropdown = null;
    }

    setupUserDropdown() {
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');
        let isOpen = false;

        if (!userInfo || !userDropdown) return;

        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen = !isOpen;
            userDropdown.classList.toggle('show', isOpen);
        });

        document.addEventListener('click', () => {
            if (isOpen) {
                isOpen = false;
                userDropdown.classList.remove('show');
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!confirm('Tem certeza que deseja sair?')) return;
                
                try {
                    if (window.SmartBizAuth) {
                        await window.SmartBizAuth.signOut();
                    } else {
                        localStorage.clear();
                    }
                    
                    this.showToast('Logout realizado!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } catch (error) {
                    console.error('Erro no logout:', error);
                    this.showToast('Erro no logout', 'error');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                }
            });
        }
    }

    setupInteractions() {
        document.querySelector('.notifications')?.addEventListener('click', () => {
            this.showToast('3 notificações não lidas', 'info');
        });
        
        document.querySelector('.search-trigger')?.addEventListener('click', () => {
            this.showToast('Busca em desenvolvimento', 'info');
        });
    }

    // ========== TOAST NOTIFICATIONS ==========
    showToast(message, type = 'info', duration = 3000) {
        document.querySelectorAll('.header-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'header-toast';
        toast.style.cssText = `
            position: fixed; top: 24px; right: 24px; padding: 16px 20px;
            border-radius: 12px; font-weight: 500; font-size: 14px; z-index: 10001;
            max-width: 350px; transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px); color: white;
            box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.25);
        `;

        const colors = {
            success: 'rgba(34, 197, 94, 0.95)',
            error: 'rgba(239, 68, 68, 0.95)',
            warning: 'rgba(245, 158, 11, 0.95)',
            info: 'rgba(99, 102, 241, 0.95)'
        };

        toast.style.background = colors[type] || colors.info;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ========== INICIALIZAÇÃO ==========
let headerSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        headerSystem = new HeaderSystem();
    });
} else {
    headerSystem = new HeaderSystem();
}

// ========== API PÚBLICA ==========
window.HeaderSystem = {
    showToast: (message, type) => headerSystem?.showToast(message, type),
    closeDropdowns: () => headerSystem?.closeAllDropdowns(),
    getCurrentUser: () => {
        try {
            const userData = localStorage.getItem('smartbiz_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    }
};

console.log('🎯 Header System com Dropdowns carregado!');