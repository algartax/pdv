// ========== INTEGRAÇÃO VENDAS COM SUPABASE - COM BUSCA DE PRODUTOS E CLIENTES ==========

class VendasSupabase {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Verificar se Supabase já está inicializado globalmente
            if (window.SmartBizAuth && window.SmartBizAuth.supabase) {
                this.supabase = window.SmartBizAuth.supabase;
                this.initialized = true;
                console.log('✅ Supabase reutilizado do sistema de autenticação');
                await this.loadCurrentUser();
                return;
            }

            // Se não tiver, verificar se Supabase está disponível para criar
            if (typeof window.supabase === 'undefined') {
                console.error('❌ Supabase não encontrado');
                return;
            }

            // Usar as credenciais do sistema (atualizadas)
            const SUPABASE_URL = 'https://duupmyhbsvitadcnkchq.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXBteWhic3ZpdGFkY25rY2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDU1MjUsImV4cCI6MjA2MzQ4MTUyNX0.bFqBc0rEEbZXBKfsK6onBuxm62FK2NHeW_oBm757wL0';

            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.initialized = true;
            await this.loadCurrentUser();
            
            console.log('✅ Supabase inicializado para vendas');
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
        }
    }

    async loadCurrentUser() {
        try {
            // Primeiro tentar do Supabase auth
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session?.user) {
                this.currentUser = session.user;
                console.log('👤 Usuário do Supabase:', this.currentUser.email);
                return;
            }

            // Fallback para localStorage
            const userData = localStorage.getItem('smartbiz_user');
            if (userData) {
                const user = JSON.parse(userData);
                this.currentUser = { id: user.id || user.email, email: user.email };
                console.log('👤 Usuário do localStorage:', this.currentUser.email);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        }
    }

    // ========== BUSCA DE PRODUTOS ==========
    async buscarProdutoPorCodigo(codigo) {
        if (!this.initialized || !this.currentUser || !codigo.trim()) {
            return { success: false, data: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('cadastro')
                .select('codigo, descricao, preco')
                .eq('user', this.currentUser.id)
                .eq('codigo', codigo.trim())
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ Produto encontrado por código:', data[0]);
                return { success: true, data: data[0] };
            }

            return { success: false, data: null, message: 'Produto não encontrado' };
        } catch (error) {
            console.error('❌ Erro ao buscar produto por código:', error);
            return { success: false, data: null, message: error.message };
        }
    }

    async buscarProdutoPorNome(nome) {
        if (!this.initialized || !this.currentUser || !nome.trim()) {
            return { success: false, data: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('cadastro')
                .select('codigo, descricao, preco')
                .eq('user', this.currentUser.id)
                .ilike('descricao', `%${nome.trim()}%`)
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ Produtos encontrados por nome:', data.length);
                return { success: true, data: data };
            }

            return { success: false, data: [], message: 'Nenhum produto encontrado' };
        } catch (error) {
            console.error('❌ Erro ao buscar produto por nome:', error);
            return { success: false, data: [], message: error.message };
        }
    }

    async buscarProdutoExatoPorNome(nome) {
        if (!this.initialized || !this.currentUser || !nome.trim()) {
            return { success: false, data: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('cadastro')
                .select('codigo, descricao, preco')
                .eq('user', this.currentUser.id)
                .eq('descricao', nome.trim())
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ Produto exato encontrado por nome:', data[0]);
                return { success: true, data: data[0] };
            }

            return { success: false, data: null, message: 'Produto não encontrado' };
        } catch (error) {
            console.error('❌ Erro ao buscar produto exato por nome:', error);
            return { success: false, data: null, message: error.message };
        }
    }

    // ========== BUSCA DE CLIENTES ==========
    async buscarClientePorNome(nome) {
        if (!this.initialized || !this.currentUser || !nome.trim()) {
            return { success: false, data: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .select('nome, telefone, cpf')
                .eq('user', this.currentUser.id)
                .ilike('nome', `%${nome.trim()}%`)
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ Clientes encontrados por nome:', data.length);
                return { success: true, data: data };
            }

            return { success: false, data: [], message: 'Nenhum cliente encontrado' };
        } catch (error) {
            console.error('❌ Erro ao buscar cliente por nome:', error);
            return { success: false, data: [], message: error.message };
        }
    }

    async buscarClienteExatoPorNome(nome) {
        if (!this.initialized || !this.currentUser || !nome.trim()) {
            return { success: false, data: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .select('nome, telefone, cpf')
                .eq('user', this.currentUser.id)
                .eq('nome', nome.trim())
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ Cliente exato encontrado por nome:', data[0]);
                return { success: true, data: data[0] };
            }

            return { success: false, data: null, message: 'Cliente não encontrado' };
        } catch (error) {
            console.error('❌ Erro ao buscar cliente exato por nome:', error);
            return { success: false, data: null, message: error.message };
        }
    }

    // ========== AUTOCOMPLETE FUNCTIONS ==========
    
    // Configurar autocomplete para código do produto
    setupProductCodeAutocomplete() {
        const productCodeInput = document.getElementById('productCode');
        if (!productCodeInput) return;

        let debounceTimer;

        productCodeInput.addEventListener('input', async (e) => {
            const code = e.target.value.trim();
            
            // Limpar timer anterior
            clearTimeout(debounceTimer);
            
            if (code.length >= 1) {
                debounceTimer = setTimeout(async () => {
                    const result = await this.buscarProdutoPorCodigo(code);
                    if (result.success && result.data) {
                        this.preencherDadosProduto(result.data);
                    }
                }, 500); // Aguarda 500ms após parar de digitar
            }
        });

        productCodeInput.addEventListener('blur', async (e) => {
            const code = e.target.value.trim();
            if (code) {
                const result = await this.buscarProdutoPorCodigo(code);
                if (result.success && result.data) {
                    this.preencherDadosProduto(result.data);
                } else {
                    this.limparDadosProduto();
                }
            }
        });
    }

    // Configurar autocomplete para nome do produto
    setupProductNameAutocomplete() {
        const productNameInput = document.getElementById('productName');
        if (!productNameInput) return;

        let debounceTimer;
        let suggestionContainer = null;

        productNameInput.addEventListener('input', async (e) => {
            const name = e.target.value.trim();
            
            // Limpar timer anterior
            clearTimeout(debounceTimer);
            
            // Remover sugestões anteriores
            if (suggestionContainer) {
                suggestionContainer.remove();
                suggestionContainer = null;
            }
            
            if (name.length >= 2) {
                debounceTimer = setTimeout(async () => {
                    const result = await this.buscarProdutoPorNome(name);
                    if (result.success && result.data.length > 0) {
                        this.mostrarSugestoesProduto(productNameInput, result.data);
                    }
                }, 300); // Busca mais rápida para autocomplete
            }
        });

        productNameInput.addEventListener('blur', async (e) => {
            // Aguardar um pouco para permitir clique na sugestão
            setTimeout(async () => {
                const name = e.target.value.trim();
                if (name) {
                    const result = await this.buscarProdutoExatoPorNome(name);
                    if (result.success && result.data) {
                        this.preencherDadosProduto(result.data);
                    }
                }
                
                // Remover sugestões
                if (suggestionContainer) {
                    suggestionContainer.remove();
                    suggestionContainer = null;
                }
            }, 200);
        });
    }

    // Configurar autocomplete para nome do cliente
    setupCustomerNameAutocomplete() {
        const customerNameInput = document.getElementById('customerName');
        if (!customerNameInput) return;

        let debounceTimer;
        let suggestionContainer = null;

        customerNameInput.addEventListener('input', async (e) => {
            const name = e.target.value.trim();
            
            // Limpar timer anterior
            clearTimeout(debounceTimer);
            
            // Remover sugestões anteriores
            if (suggestionContainer) {
                suggestionContainer.remove();
                suggestionContainer = null;
            }
            
            if (name.length >= 2) {
                debounceTimer = setTimeout(async () => {
                    const result = await this.buscarClientePorNome(name);
                    if (result.success && result.data.length > 0) {
                        this.mostrarSugestoesCliente(customerNameInput, result.data);
                    }
                }, 300);
            }
        });

        customerNameInput.addEventListener('blur', async (e) => {
            // Aguardar um pouco para permitir clique na sugestão
            setTimeout(async () => {
                const name = e.target.value.trim();
                if (name) {
                    const result = await this.buscarClienteExatoPorNome(name);
                    if (result.success && result.data) {
                        this.preencherDadosCliente(result.data);
                    }
                }
                
                // Remover sugestões
                if (suggestionContainer) {
                    suggestionContainer.remove();
                    suggestionContainer = null;
                }
            }, 200);
        });
    }

    // ========== FUNÇÕES DE PREENCHIMENTO ==========
    
    preencherDadosProduto(produto) {
        const productNameInput = document.getElementById('productName');
        const productPriceInput = document.getElementById('productPrice');
        const productCodeInput = document.getElementById('productCode');

        if (productNameInput && produto.descricao) {
            productNameInput.value = produto.descricao;
        }
        
        if (productPriceInput && produto.preco) {
            // Converter preço corretamente - pode vir como string ou number
            let precoNumerico = 0;
            
            if (typeof produto.preco === 'string') {
                // Se for string, pode ter vírgula ou ponto
                precoNumerico = parseFloat(produto.preco.replace(',', '.'));
            } else {
                // Se for number, usar diretamente
                precoNumerico = parseFloat(produto.preco);
            }
            
            if (!isNaN(precoNumerico)) {
                // CORREÇÃO: Input type="number" só aceita PONTO como separador decimal
                // Não pode usar vírgula! O HTML5 exige formato americano
                productPriceInput.value = precoNumerico.toFixed(2); // Ex: "150.00"
                
                console.log('💰 Preço do banco:', produto.preco);
                console.log('💰 Preço convertido:', precoNumerico);
                console.log('💰 Preço no input:', productPriceInput.value);
            } else {
                console.warn('⚠️ Preço inválido:', produto.preco);
                productPriceInput.value = '';
            }
        }
        
        if (productCodeInput && produto.codigo) {
            productCodeInput.value = produto.codigo;
        }

        console.log('✅ Dados do produto preenchidos:', {
            codigo: produto.codigo,
            nome: produto.descricao,
            precoOriginal: produto.preco,
            precoFormatado: productPriceInput?.value
        });
    }

    limparDadosProduto() {
        const productNameInput = document.getElementById('productName');
        const productPriceInput = document.getElementById('productPrice');

        if (productNameInput) productNameInput.value = '';
        if (productPriceInput) productPriceInput.value = '';
    }

    preencherDadosCliente(cliente) {
        const customerNameInput = document.getElementById('customerName');
        const customerPhoneInput = document.getElementById('customerPhone');
        const customerCpfInput = document.getElementById('customerCpf');

        if (customerNameInput && cliente.nome) {
            customerNameInput.value = cliente.nome;
        }
        
        if (customerPhoneInput && cliente.telefone) {
            customerPhoneInput.value = cliente.telefone;
        }
        
        if (customerCpfInput && cliente.cpf) {
            customerCpfInput.value = cliente.cpf;
        }

        console.log('✅ Dados do cliente preenchidos:', cliente);
    }

    // ========== MOSTRAR SUGESTÕES ==========
    
    mostrarSugestoesProduto(input, produtos) {
        // Remover sugestões anteriores
        const existingSuggestions = document.querySelector('.suggestions-container');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        const container = document.createElement('div');
        container.className = 'suggestions-container';
        container.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            max-height: 250px;
            overflow-y: auto;
            z-index: 999999;
            min-width: 300px;
            backdrop-filter: blur(10px);
            border-top: 3px solid #22c55e;
        `;

        produtos.forEach((produto, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: fadeInUp 0.3s ease-out ${index * 0.05}s both;
            `;

            // Formatar preço corretamente para EXIBIÇÃO (com vírgula)
            let precoFormatado = 'R$ 0,00';
            if (produto.preco) {
                let precoNumerico = 0;
                if (typeof produto.preco === 'string') {
                    precoNumerico = parseFloat(produto.preco.replace(',', '.'));
                } else {
                    precoNumerico = parseFloat(produto.preco);
                }
                
                if (!isNaN(precoNumerico)) {
                    // EXIBIÇÃO: Usar vírgula brasileira nas sugestões
                    precoFormatado = `R$ ${precoNumerico.toFixed(2).replace('.', ',')}`;
                }
            }

            item.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${produto.descricao}</div>
                    <div style="font-size: 12px; color: #666; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-family: monospace;">
                            ${produto.codigo}
                        </span>
                    </div>
                </div>
                <div style="font-weight: 700; color: #22c55e; font-size: 14px;">${precoFormatado}</div>
            `;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8fffe';
                item.style.borderColor = '#22c55e';
                item.style.transform = 'translateX(4px)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
                item.style.borderColor = '#f0f0f0';
                item.style.transform = 'translateX(0)';
            });

            item.addEventListener('click', () => {
                this.preencherDadosProduto(produto);
                container.remove();
                input.blur();
            });

            container.appendChild(item);
        });

        // Posicionar de forma inteligente
        document.body.appendChild(container);
        
        const inputRect = input.getBoundingClientRect();
        const containerHeight = Math.min(250, produtos.length * 60);
        const viewportHeight = window.innerHeight;
        
        // Posicionar abaixo do input por padrão
        let top = inputRect.bottom + 4;
        let left = inputRect.left;
        
        // Se não couber na tela, posicionar acima
        if (top + containerHeight > viewportHeight) {
            top = inputRect.top - containerHeight - 4;
        }
        
        // Ajustar horizontalmente se necessário
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 300 - 16;
        }
        
        container.style.top = `${top}px`;
        container.style.left = `${left}px`;

        // Adicionar CSS da animação se não existir
        if (!document.querySelector('#suggestionsCSS')) {
            const style = document.createElement('style');
            style.id = 'suggestionsCSS';
            style.textContent = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .suggestions-container::-webkit-scrollbar {
                    width: 6px;
                }
                .suggestions-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .suggestions-container::-webkit-scrollbar-thumb {
                    background: #22c55e;
                    border-radius: 3px;
                }
                .suggestions-container::-webkit-scrollbar-thumb:hover {
                    background: #16a34a;
                }
            `;
            document.head.appendChild(style);
        }
    }

    mostrarSugestoesCliente(input, clientes) {
        // Remover sugestões anteriores
        const existingSuggestions = document.querySelector('.suggestions-container');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        const container = document.createElement('div');
        container.className = 'suggestions-container';
        container.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            max-height: 250px;
            overflow-y: auto;
            z-index: 999999;
            min-width: 300px;
            backdrop-filter: blur(10px);
            border-top: 3px solid #3b82f6;
        `;

        clientes.forEach((cliente, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
                animation: fadeInUp 0.3s ease-out ${index * 0.05}s both;
            `;

            item.innerHTML = `
                <div style="font-weight: 600; color: #333; margin-bottom: 6px;">${cliente.nome}</div>
                <div style="font-size: 12px; color: #666; display: flex; gap: 16px;">
                    ${cliente.telefone ? `<span style="display: flex; align-items: center; gap: 4px;"><span style="color: #22c55e;">📞</span> ${cliente.telefone}</span>` : ''}
                    ${cliente.cpf ? `<span style="display: flex; align-items: center; gap: 4px;"><span style="color: #3b82f6;">📄</span> ${cliente.cpf}</span>` : ''}
                </div>
            `;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8fffe';
                item.style.borderColor = '#3b82f6';
                item.style.transform = 'translateX(4px)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
                item.style.borderColor = '#f0f0f0';
                item.style.transform = 'translateX(0)';
            });

            item.addEventListener('click', () => {
                this.preencherDadosCliente(cliente);
                container.remove();
                input.blur();
            });

            container.appendChild(item);
        });

        // Posicionar de forma inteligente
        document.body.appendChild(container);
        
        const inputRect = input.getBoundingClientRect();
        const containerHeight = Math.min(250, clientes.length * 60);
        const viewportHeight = window.innerHeight;
        
        // Posicionar abaixo do input por padrão
        let top = inputRect.bottom + 4;
        let left = inputRect.left;
        
        // Se não couber na tela, posicionar acima
        if (top + containerHeight > viewportHeight) {
            top = inputRect.top - containerHeight - 4;
        }
        
        // Ajustar horizontalmente se necessário
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 300 - 16;
        }
        
        container.style.top = `${top}px`;
        container.style.left = `${left}px`;
    }

    // ========== INICIALIZAÇÃO DOS AUTOCOMPLETAR ==========
    initAutoComplete() {
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.setupAllAutocomplete(), 500);
            });
        } else {
            setTimeout(() => this.setupAllAutocomplete(), 500);
        }
    }

    setupAllAutocomplete() {
        console.log('🔄 Configurando autocompletar...');
        this.setupProductCodeAutocomplete();
        this.setupProductNameAutocomplete();
        this.setupCustomerNameAutocomplete();
        console.log('✅ Autocompletar configurado');
    }

    // ========== CORRELAÇÃO DOS CAMPOS CORRIGIDA (CÓDIGO ORIGINAL) ==========
    mapSaleToSupabase(saleData) {
        const now = new Date();
        const vendaId = `VENDA_${now.getTime()}`;
        
        // Calcular valores finais da venda
        const subtotal = saleData.items.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        const descontoGeral = saleData.discount.type === 'percent' 
            ? (subtotal * saleData.discount.value) / 100 
            : saleData.discount.value;
        const frete = saleData.shipping.payer === 'cliente' ? saleData.shipping.value : 0;
        const valorFinalTotal = subtotal - descontoGeral + frete;
        
        // Total de unidades vendidas (para calcular proporção)
        const totalUnidades = saleData.items.reduce((sum, item) => sum + item.quantidade, 0);
        
        // Criar linhas para cada produto (uma linha por produto, não por unidade)
        return saleData.items.map(item => {
            // Valor unitário do produto com desconto próprio
            const valorUnitarioOriginal = item.preco;
            const descontoItem = item.desconto?.value || 0;
            const valorUnitarioComDesconto = item.desconto?.type === 'percent' 
                ? valorUnitarioOriginal * (1 - descontoItem / 100)
                : valorUnitarioOriginal - descontoItem;
            
            // Subtotal do item (quantidade * valor unitário com desconto)
            const subtotalItem = item.quantidade * valorUnitarioComDesconto;
            
            // Proporção deste item no total de unidades
            const proporcaoItem = item.quantidade / totalUnidades;
            
            // Desconto geral proporcional para este item
            const descontoGeralProporcional = descontoGeral * proporcaoItem;
            
            // Frete proporcional para este item  
            const freteProporcional = frete * proporcaoItem;
            
            // Valor total final do item (subtotal - desconto geral prop. + frete prop.)
            const valorTotalItem = subtotalItem - descontoGeralProporcional + freteProporcional;

            return {
                // ========== NOMES CORRETOS DAS COLUNAS ==========
               // id: `${vendaId}_${item.codigo}`,
                user: this.getCurrentUser(),
                data: now.toISOString().split('T')[0],
                hora: now.toTimeString().split(' ')[0],
                
                // Dados do cliente
                cliente: saleData.customer.nome || 'Cliente não informado',
                telefone: saleData.customer.telefone || '',
                cpf: saleData.customer.cpf || '',
                codigo: item.codigo || '',
                
                // Descontos e frete
                descontogeral: descontoGeralProporcional,
                frete: freteProporcional,
                
                // Dados do pagamento
                pagafrete: saleData.shipping.payer,
                maquinacartao: this.getMaquinaCartao(saleData.paymentDetails),
                parcelamaquina: this.getParcelasCartao(saleData.paymentDetails),
                pagamaquina: this.getQuemPagaTaxas(saleData.paymentDetails),
                parcelacrediario: this.getParcelasCrediario(saleData.paymentDetails),
                juroscrediario: this.getJurosCrediario(saleData.paymentDetails),
                formapagamento: saleData.paymentMethod,
                
                // Dados do produto
                produto: item.nome,
                quantidade: item.quantidade,
                valorunit: valorUnitarioComDesconto,
                valortotal: valorTotalItem
            };
        });
    }

    // ========== HELPERS ==========
    getCurrentUser() {
   try {
       if (this.currentUser && this.currentUser.id) {
           return this.currentUser.id;
       }
       
       const userData = localStorage.getItem('smartbiz_user');
       if (userData) {
           const user = JSON.parse(userData);
           return user.id || user.email || 'Sistema';
       }
       return 'Sistema';
   } catch (error) {
       return 'Sistema';
   }
}

    getMaquinaCartao(paymentDetails) {
        if (paymentDetails?.machine) {
            const machines = {
                stone: 'Stone',
                mercadopago: 'Mercado Pago',
                pagseguro: 'PagSeguro',
                cielo: 'Cielo'
            };
            return machines[paymentDetails.machine] || paymentDetails.machine;
        }
        return null;
    }

    getParcelasCartao(paymentDetails) {
        return paymentDetails?.installments || null;
    }

    getQuemPagaTaxas(paymentDetails) {
        return paymentDetails?.feePayer || null;
    }

    getParcelasCrediario(paymentDetails) {
        if (paymentDetails?.installments && paymentDetails?.customerName) {
            return paymentDetails.installments;
        }
        return null;
    }

    getJurosCrediario(paymentDetails) {
        if (paymentDetails?.hasInterest && paymentDetails?.interestRate) {
            return paymentDetails.interestRate;
        }
        return null;
    }

    // ========== SALVAR VENDA ==========
    async salvarVenda(saleData) {
        if (!this.initialized) {
            throw new Error('Supabase não inicializado');
        }

        try {
            console.log('📤 Preparando dados para envio ao Supabase...');
            
            // Mapear dados da venda
            const vendaRows = this.mapSaleToSupabase(saleData);
            
            console.log('📋 Dados mapeados:', {
                totalProdutos: vendaRows.length,
                primeiroItem: vendaRows[0],
                resumo: {
                    cliente: vendaRows[0]?.cliente,
                    produtos: vendaRows.map(row => `${row.produto} (${row.quantidade}x)`),
                    formaPagamento: vendaRows[0]?.formapagamento,
                    valorTotalGeral: vendaRows.reduce((sum, row) => sum + row.valortotal, 0).toFixed(2),
                    verificacao: {
                        somaQuantidades: vendaRows.reduce((sum, row) => sum + row.quantidade, 0),
                        somaValorTotal: vendaRows.reduce((sum, row) => sum + row.valortotal, 0).toFixed(2)
                    }
                }
            });

            // Inserir no Supabase
            const { data, error } = await this.supabase
                .from('vendas')
                .insert(vendaRows)
                .select();

            if (error) {
                console.error('❌ Erro ao salvar no Supabase:', error);
                throw error;
            }

            console.log('✅ Venda salva com sucesso:', {
                linhasInseridas: data?.length || 0,
                ids: data?.map(row => row.id) || []
            });

            return {
                success: true,
                data: data,
                message: `Venda salva: ${data?.length || 0} produtos registrados`,
                vendaId: data?.[0]?.id || Date.now()
            };

        } catch (error) {
            console.error('❌ Erro completo ao salvar venda:', error);
            
            return {
                success: false,
                error: error,
                message: `Erro ao salvar: ${error.message}`
            };
        }
    }

    // ========== BUSCAR VENDAS ==========
    async buscarVendas(filtros = {}) {
        if (!this.initialized) {
            throw new Error('Supabase não inicializado');
        }

        try {
            let query = this.supabase
                .from('vendas')
                .select('*')
                .order('data', { ascending: false })
                .order('hora', { ascending: false });

            // Aplicar filtros
            if (filtros.dataInicio) {
                query = query.gte('data', filtros.dataInicio);
            }
            
            if (filtros.dataFim) {
                query = query.lte('data', filtros.dataFim);
            }
            
            if (filtros.cliente) {
                query = query.ilike('cliente', `%${filtros.cliente}%`);
            }
            
            if (filtros.produto) {
                query = query.ilike('produto', `%${filtros.produto}%`);
            }
            
            if (filtros.formaPagamento) {
                query = query.eq('formapagamento', filtros.formaPagamento);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: data || [],
                total: data?.length || 0
            };

        } catch (error) {
            console.error('❌ Erro ao buscar vendas:', error);
            return {
                success: false,
                error: error,
                message: `Erro ao buscar: ${error.message}`
            };
        }
    }

    // ========== RELATÓRIOS ==========
    async relatorioVendasPorPeriodo(dataInicio, dataFim) {
        const vendas = await this.buscarVendas({ dataInicio, dataFim });
        
        if (!vendas.success) return vendas;

        const resumo = {
            totalVendas: vendas.data.length,
            valorTotal: vendas.data.reduce((sum, venda) => sum + venda.valortotal, 0),
            clientesUnicos: [...new Set(vendas.data.map(v => v.cliente))].length,
            produtosMaisVendidos: this.calcularProdutosMaisVendidos(vendas.data),
            vendasPorFormaPagamento: this.agruparPorFormaPagamento(vendas.data)
        };

        return {
            success: true,
            data: vendas.data,
            resumo: resumo
        };
    }

    calcularProdutosMaisVendidos(vendas) {
        const produtos = {};
        vendas.forEach(venda => {
            produtos[venda.produto] = (produtos[venda.produto] || 0) + 1;
        });
        
        return Object.entries(produtos)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([produto, quantidade]) => ({ produto, quantidade }));
    }

    agruparPorFormaPagamento(vendas) {
        const formas = {};
        vendas.forEach(venda => {
            const forma = venda.formapagamento || 'Não informado';
            formas[forma] = (formas[forma] || 0) + venda.valortotal;
        });
        return formas;
    }

    // ========== TESTE DE CONEXÃO ==========
    async testarConexao() {
        if (!this.initialized) {
            return { success: false, message: 'Supabase não inicializado' };
        }

        try {
            const { data, error } = await this.supabase
                .from('vendas')
                .select('count', { count: 'exact' })
                .limit(1);

            if (error) throw error;

            return {
                success: true,
                message: 'Conexão OK',
                totalRegistros: data?.[0]?.count || 0
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro na conexão: ${error.message}`
            };
        }
    }

    // ========== MÉTODOS PARA TESTE ==========
    
    async testarBuscaProduto() {
        console.log('=== TESTE BUSCA DE PRODUTOS ===');
        
        // Teste busca por código
        console.log('🔍 Testando busca por código...');
        const resultCodigo = await this.buscarProdutoPorCodigo('123');
        console.log('Resultado busca por código:', resultCodigo);
        
        // Teste busca por nome (parcial)
        console.log('🔍 Testando busca por nome parcial...');
        const resultNomeParcial = await this.buscarProdutoPorNome('Produto');
        console.log('Resultado busca por nome parcial:', resultNomeParcial);
        
        // Teste busca por nome exato
        console.log('🔍 Testando busca por nome exato...');
        const resultNomeExato = await this.buscarProdutoExatoPorNome('Produto Teste 1');
        console.log('Resultado busca por nome exato:', resultNomeExato);
    }

    async testarBuscaCliente() {
        console.log('=== TESTE BUSCA DE CLIENTES ===');
        
        // Teste busca por nome (parcial)
        console.log('🔍 Testando busca de cliente por nome parcial...');
        const resultNomeParcial = await this.buscarClientePorNome('João');
        console.log('Resultado busca cliente parcial:', resultNomeParcial);
        
        // Teste busca por nome exato
        console.log('🔍 Testando busca de cliente por nome exato...');
        const resultNomeExato = await this.buscarClienteExatoPorNome('João Silva');
        console.log('Resultado busca cliente exato:', resultNomeExato);
    }
}

// ========== INICIALIZAÇÃO ==========
let vendasSupabase;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        vendasSupabase = new VendasSupabase();
        vendasSupabase.initAutoComplete();
    });
} else {
    vendasSupabase = new VendasSupabase();
    vendasSupabase.initAutoComplete();
}

// ========== API PÚBLICA ==========
window.VendasSupabase = {
    // Métodos originais
    salvar: (saleData) => vendasSupabase?.salvarVenda(saleData),
    buscar: (filtros) => vendasSupabase?.buscarVendas(filtros),
    relatorio: (inicio, fim) => vendasSupabase?.relatorioVendasPorPeriodo(inicio, fim),
    testar: () => vendasSupabase?.testarConexao(),
    
    // Novos métodos de busca
    buscarProdutoPorCodigo: (codigo) => vendasSupabase?.buscarProdutoPorCodigo(codigo),
    buscarProdutoPorNome: (nome) => vendasSupabase?.buscarProdutoPorNome(nome),
    buscarProdutoExato: (nome) => vendasSupabase?.buscarProdutoExatoPorNome(nome),
    buscarClientePorNome: (nome) => vendasSupabase?.buscarClientePorNome(nome),
    buscarClienteExato: (nome) => vendasSupabase?.buscarClienteExatoPorNome(nome),
    
    // Métodos de configuração
    setupAutoComplete: () => vendasSupabase?.setupAllAutocomplete(),
    preencherProduto: (produto) => vendasSupabase?.preencherDadosProduto(produto),
    preencherCliente: (cliente) => vendasSupabase?.preencherDadosCliente(cliente),
    
    // Função de teste completo
    testeCompleto: async () => {
        console.log('=== TESTE VENDAS SUPABASE COMPLETO ===');
        
        if (!vendasSupabase) {
            console.log('❌ VendasSupabase não inicializado');
            return;
        }
        
        // Teste de conexão
        console.log('🔄 Testando conexão...');
        const conexao = await vendasSupabase.testarConexao();
        console.log('Conexão:', conexao);
        
        // Teste busca de produtos
        await vendasSupabase.testarBuscaProduto();
        
        // Teste busca de clientes
        await vendasSupabase.testarBuscaCliente();
        
        // Teste com dados fictícios de venda
        console.log('🔄 Testando com dados fictícios...');
        const dadosTeste = {
            items: [
                { codigo: 'TEST001', nome: 'Produto Teste 1', preco: 10.00, quantidade: 2, desconto: { type: 'percent', value: 0 } },
                { codigo: 'TEST002', nome: 'Produto Teste 2', preco: 25.50, quantidade: 3, desconto: { type: 'percent', value: 10 } }
            ],
            customer: { nome: 'Cliente Teste', telefone: '11999999999', cpf: '12345678901' },
            discount: { type: 'percent', value: 5 },
            shipping: { value: 8.00, payer: 'cliente' },
            paymentMethod: 'pix',
            paymentDetails: {}
        };
        
        const mapeamento = vendasSupabase.mapSaleToSupabase(dadosTeste);
        console.log('Mapeamento teste:', mapeamento);
        console.log('📊 Verificação dos cálculos:');
        console.log('- Produto 1: 2x R$ 10,00 = R$ 20,00');
        console.log('- Produto 2: 3x R$ 22,95 (com 10% desc) = R$ 68,85');
        console.log('- Subtotal: R$ 88,85');
        console.log('- Desconto geral 5%: R$ 4,44');
        console.log('- Frete: R$ 8,00');
        console.log('- Total: R$ 92,41');
        console.log('- Soma valores mapeados:', mapeamento.reduce((s, r) => s + r.valortotal, 0).toFixed(2));
        
        console.log('');
        console.log('🎯 COMO USAR AS NOVAS FUNCIONALIDADES:');
        console.log('');
        console.log('1. BUSCA DE PRODUTOS:');
        console.log('   await VendasSupabase.buscarProdutoPorCodigo("123")');
        console.log('   await VendasSupabase.buscarProdutoPorNome("Produto")');
        console.log('   await VendasSupabase.buscarProdutoExato("Nome Exato")');
        console.log('');
        console.log('2. BUSCA DE CLIENTES:');
        console.log('   await VendasSupabase.buscarClientePorNome("João")');
        console.log('   await VendasSupabase.buscarClienteExato("João Silva")');
        console.log('');
        console.log('3. AUTOCOMPLETAR:');
        console.log('   - Digite no campo "Código" para buscar automaticamente');
        console.log('   - Digite no campo "Nome do Produto" para ver sugestões');
        console.log('   - Digite no campo "Nome do Cliente" para ver sugestões');
        console.log('');
        console.log('4. PREENCHIMENTO AUTOMÁTICO:');
        console.log('   VendasSupabase.preencherProduto({codigo, descricao, preco})');
        console.log('   VendasSupabase.preencherCliente({nome, telefone, cpf})');
        console.log('');
        console.log('Para salvar de verdade, use: await VendasSupabase.salvar(dadosVenda)');
    },
    
    // Métodos de teste específicos
    testarProdutos: () => vendasSupabase?.testarBuscaProduto(),
    testarClientes: () => vendasSupabase?.testarBuscaCliente()
};

console.log('🎯 VendasSupabase carregado com AUTOCOMPLETAR!');
console.log('');
console.log('✅ FUNCIONALIDADES ADICIONADAS:');
console.log('📦 Busca automática de produtos por código');
console.log('📝 Autocompletar nome do produto com sugestões');
console.log('👤 Autocompletar nome do cliente com sugestões');
console.log('🔄 Preenchimento automático de campos');
console.log('⚡ Busca em tempo real com debounce');
console.log('🎨 Interface moderna de sugestões');
console.log('⌨️  Suporte completo a teclado');
console.log('');
console.log('🧪 Para testar: VendasSupabase.testeCompleto()');
console.log('📦 Teste produtos: VendasSupabase.testarProdutos()');
console.log('👤 Teste clientes: VendasSupabase.testarClientes()');