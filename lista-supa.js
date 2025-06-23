// ========== SUPABASE MANAGER - ESTOQUE OTIMIZADO ==========

class SupabaseEstoqueManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        try {
            if (window.supabase) {
                const URL = 'https://duupmyhbsvitadcnkchq.supabase.co';
                const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXBteWhic3ZpdGFkY25rY2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDU1MjUsImV4cCI6MjA2MzQ4MTUyNX0.bFqBc0rEEbZXBKfsK6onBuxm62FK2NHeW_oBm757wL0';
                this.supabase = window.supabase.createClient(URL, KEY);
                this.isInitialized = true;
                console.log('✅ Supabase Manager inicializado');
            } else {
                console.error('❌ Supabase não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
        }
    }

    async getCurrentUser() {
        if (!this.isInitialized) {
            throw new Error('Supabase não inicializado');
        }

        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            
            if (!session?.user) {
                throw new Error('Usuário não autenticado');
            }

            this.currentUser = session.user;
            return this.currentUser;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            throw error;
        }
    }

    // ========== CARREGAR PRODUTOS COM ESTOQUE REAL ==========
    async loadProductsWithRealStock() {
        try {
            await this.getCurrentUser();

            // Buscar produtos cadastrados
            const { data: produtos, error: produtosError } = await this.supabase
                .from('cadastro')
                .select('*')
                .eq('user', this.currentUser.id)
                .order('descricao');

            if (produtosError) throw produtosError;

            if (!produtos || produtos.length === 0) {
                return [];
            }

            // Buscar vendas
            const { data: vendas, error: vendasError } = await this.supabase
                .from('vendas')
                .select('codigo, quantidade')
                .eq('user', this.currentUser.id);

            if (vendasError) {
                console.error('Erro ao buscar vendas:', vendasError);
            }

            // Criar mapa de vendas por código
            const vendasPorCodigo = {};
            if (vendas) {
                vendas.forEach(venda => {
                    const codigo = venda.codigo;
                    const quantidade = parseFloat(venda.quantidade) || 0;
                    
                    if (!vendasPorCodigo[codigo]) {
                        vendasPorCodigo[codigo] = 0;
                    }
                    vendasPorCodigo[codigo] += quantidade;
                });
            }

            // Calcular estoque real
            const produtosComEstoque = produtos.map(produto => {
                const quantidadeCadastrada = parseFloat(produto.quantidade) || 0;
                const totalVendido = vendasPorCodigo[produto.codigo] || 0;
                const estoqueReal = Math.max(0, quantidadeCadastrada - totalVendido);

                return {
                    ...produto,
                    quantidade_original: quantidadeCadastrada,
                    quantidade_vendida: totalVendido,
                    quantidade: estoqueReal
                };
            });

            return produtosComEstoque;

        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            throw error;
        }
    }

    // ========== ATUALIZAR PRODUTO ==========
    async updateProduct(productId, updatedData) {
        try {
            await this.getCurrentUser();

            const { data, error } = await this.supabase
                .from('cadastro')
                .update(updatedData)
                .eq('id', productId)
                .eq('user', this.currentUser.id)
                .select();

            if (error) throw error;

            return data[0];

        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    // ========== EXCLUIR PRODUTO ==========
    async deleteProduct(productId) {
        try {
            await this.getCurrentUser();

            const { error } = await this.supabase
                .from('cadastro')
                .delete()
                .eq('id', productId)
                .eq('user', this.currentUser.id);

            if (error) throw error;

            return true;

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    }

    // ========== OBTER CATEGORIAS ==========
    async getCategories() {
        try {
            await this.getCurrentUser();

            const { data, error } = await this.supabase
                .from('cadastro')
                .select('categoria')
                .eq('user', this.currentUser.id)
                .not('categoria', 'is', null);

            if (error) throw error;

            // Extrair categorias únicas
            const categorias = [...new Set(data.map(item => item.categoria).filter(Boolean))];
            return categorias.sort();

        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
    }

    // ========== OBTER MARCAS ==========
    async getBrands() {
        try {
            await this.getCurrentUser();

            const { data, error } = await this.supabase
                .from('cadastro')
                .select('marca')
                .eq('user', this.currentUser.id)
                .not('marca', 'is', null);

            if (error) throw error;

            // Extrair marcas únicas
            const marcas = [...new Set(data.map(item => item.marca).filter(Boolean))];
            return marcas.sort();

        } catch (error) {
            console.error('Erro ao buscar marcas:', error);
            return [];
        }
    }

    // ========== REGISTRAR VENDA ==========
    async registrarVenda(codigo, quantidade, dadosVenda = {}) {
        try {
            await this.getCurrentUser();

            // Calcular estoque disponível
            const { data: produto } = await this.supabase
                .from('cadastro')
                .select('quantidade, descricao')
                .eq('user', this.currentUser.id)
                .eq('codigo', codigo)
                .single();

            if (!produto) {
                return {
                    success: false,
                    message: 'Produto não encontrado'
                };
            }

            // Buscar total vendido
            const { data: vendas } = await this.supabase
                .from('vendas')
                .select('quantidade')
                .eq('user', this.currentUser.id)
                .eq('codigo', codigo);

            const totalVendido = vendas?.reduce((sum, v) => sum + (parseFloat(v.quantidade) || 0), 0) || 0;
            const estoqueAtual = (produto.quantidade || 0) - totalVendido;

            if (estoqueAtual < quantidade) {
                return {
                    success: false,
                    message: `Estoque insuficiente. Disponível: ${estoqueAtual}`
                };
            }

            // Registrar venda
            const vendaData = {
                user: this.currentUser.id,
                codigo: codigo,
                quantidade: quantidade,
                ...dadosVenda
            };

            const { data, error } = await this.supabase
                .from('vendas')
                .insert([vendaData])
                .select();

            if (error) throw error;

            return {
                success: true,
                venda: data[0],
                produto: produto.descricao,
                estoqueAnterior: estoqueAtual,
                estoqueNovo: estoqueAtual - quantidade
            };

        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// ========== INSTÂNCIA GLOBAL ==========
const supaEstoque = new SupabaseEstoqueManager();

// ========== API PÚBLICA ==========
window.SupaManager = {
    getInstance: () => supaEstoque,
    loadProducts: () => supaEstoque.loadProductsWithRealStock(),
    updateProduct: (id, data) => supaEstoque.updateProduct(id, data),
    deleteProduct: (id) => supaEstoque.deleteProduct(id),
    getCurrentUser: () => supaEstoque.getCurrentUser(),
    getCategories: () => supaEstoque.getCategories(),
    getBrands: () => supaEstoque.getBrands(),
    registrarVenda: (code, qty, data) => supaEstoque.registrarVenda(code, qty, data)
};

console.log('🚀 Supabase Manager Otimizado carregado!');