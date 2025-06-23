// ========== CADASTRO DE PRODUTOS COM MODAL MODERNO - JAVASCRIPT ========== 

class ModernProductRegistrationWithModal {
    constructor() {
        this.supabase = null;
        this.autoCalculateEnabled = false;
        this.additionalFieldsVisible = false;
        this.currentUser = null;
        this.dropdownData = {};
        this.selectedValues = {};
        this.currentField = null;
        this.currentTrigger = null;
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    async start() {
        try {
            await this.waitForHeader();
            this.initSupabase();
            this.setupInterface();
            this.setupPriceCalculation();
            this.setupModalSystem();
            await this.loadDropdownData();
            console.log('✅ Sistema de cadastro com modal moderno carregado');
        } catch (error) {
            console.error('❌ Erro:', error);
            this.showToast('Erro ao carregar sistema', 'error');
        }
    }

    async waitForHeader() {
        return new Promise(resolve => {
            if (window.HeaderSystem) {
                resolve();
            } else {
                const check = setInterval(() => {
                    if (window.HeaderSystem) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(check);
                    resolve();
                }, 3000);
            }
        });
    }

    initSupabase() {
        if (window.supabase) {
            const URL = 'https://duupmyhbsvitadcnkchq.supabase.co';
            const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXBteWhic3ZpdGFkY25rY2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDU1MjUsImV4cCI6MjA2MzQ4MTUyNX0.bFqBc0rEEbZXBKfsK6onBuxm62FK2NHeW_oBm757wL0';
            this.supabase = window.supabase.createClient(URL, KEY);
            console.log('✅ Supabase conectado');
        } else {
            console.error('❌ Supabase não encontrado');
        }
    }

    // ========== CARREGAR DADOS DO SUPABASE ==========
    async loadDropdownData() {
        if (!this.supabase) {
            console.error('Supabase não inicializado');
            return;
        }

        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session?.user) {
            console.error('Usuário não logado');
            return;
        }
        
        this.currentUser = session.user;
        console.log('👤 Usuário logado:', this.currentUser.email);

        try {
            await Promise.all([
                this.loadCategorias(),
                this.loadMarcas(),
                this.loadCores(),
                this.loadNCMs(),
                this.loadFornecedores(),
                this.loadGrades()
            ]);
            
            console.log('✅ Dados dos dropdowns carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar opções', 'error');
        }
    }

    async loadCategorias() {
        try {
            const { data, error } = await this.supabase
                .from('categorias')
                .select('nome')
                .eq('user', this.currentUser.id)
                .order('nome');

            if (error) throw error;

            this.dropdownData.categoria = data.map(item => ({
                value: item.nome,
                label: item.nome
            }));

            console.log('📂 Categorias carregadas:', this.dropdownData.categoria.length);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            this.dropdownData.categoria = [];
        }
    }

    async loadMarcas() {
        try {
            const { data, error } = await this.supabase
                .from('marca')
                .select('marca')
                .eq('user', this.currentUser.id)
                .order('marca');

            if (error) throw error;

            this.dropdownData.marca = data.map(item => ({
                value: item.marca,
                label: item.marca
            }));

            console.log('🏷️ Marcas carregadas:', this.dropdownData.marca.length);
        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
            this.dropdownData.marca = [];
        }
    }

    async loadCores() {
        try {
            const { data, error } = await this.supabase
                .from('cores')
                .select('cor')
                .eq('user', this.currentUser.id)
                .order('cor');

            if (error) throw error;

            this.dropdownData.cor = data.map(item => ({
                value: item.cor,
                label: item.cor
            }));

            console.log('🎨 Cores carregadas:', this.dropdownData.cor.length);
        } catch (error) {
            console.error('Erro ao carregar cores:', error);
            this.dropdownData.cor = [];
        }
    }

    async loadNCMs() {
        try {
            const { data, error } = await this.supabase
                .from('ncms')
                .select('ncm, descricao')
                .eq('user', this.currentUser.id)
                .order('ncm');

            if (error) throw error;

            this.dropdownData.ncm = data.map(item => ({
                value: item.ncm,
                label: `${item.ncm} - ${item.descricao}`
            }));

            console.log('📋 NCMs carregados:', this.dropdownData.ncm.length);
        } catch (error) {
            console.error('Erro ao carregar NCMs:', error);
            this.dropdownData.ncm = [];
        }
    }

    async loadFornecedores() {
        try {
            const { data, error } = await this.supabase
                .from('fornecedores')
                .select('nome')
                .eq('user', this.currentUser.id)
                .order('nome');

            if (error) throw error;

            this.dropdownData.fornecedor = data.map(item => ({
                value: item.nome,
                label: item.nome
            }));

            console.log('🏢 Fornecedores carregados:', this.dropdownData.fornecedor.length);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            this.dropdownData.fornecedor = [];
        }
    }

    loadGrades() {
        // Grades tradicionais - não vem do banco
        this.dropdownData.grade = [
            { value: 'PP', label: 'PP (Extra Pequeno)' },
            { value: 'P', label: 'P (Pequeno)' },
            { value: 'M', label: 'M (Médio)' },
            { value: 'G', label: 'G (Grande)' },
            { value: 'GG', label: 'GG (Extra Grande)' },
            { value: 'XG', label: 'XG (Extra Grande)' },
            { value: 'XXG', label: 'XXG (Extra Extra Grande)' },
            { value: 'UNICO', label: 'Tamanho Único' },
            { value: '34', label: '34' },
            { value: '36', label: '36' },
            { value: '38', label: '38' },
            { value: '40', label: '40' },
            { value: '42', label: '42' },
            { value: '44', label: '44' },
            { value: '46', label: '46' },
            { value: '48', label: '48' },
            { value: '50', label: '50' },
            { value: '52', label: '52' }
        ];

        console.log('📏 Grades carregadas:', this.dropdownData.grade.length);
    }

    // ========== SISTEMA DE MODAL MODERNO ==========
    setupModalSystem() {
        // Event listeners para triggers dos modais
        document.querySelectorAll('.modal-select-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const field = trigger.dataset.field;
                this.openModal(field, trigger);
            });
        });

        // Fechar modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.closeModal();
            }
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });

        // Busca em tempo real
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });

        // Enter para selecionar primeira opção
        document.getElementById('searchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = document.querySelector('.option-item:not(.no-results):not(.loading-state)');
                if (firstOption) {
                    const value = firstOption.dataset.value;
                    const label = firstOption.querySelector('.option-text').textContent;
                    this.selectOption(value, label);
                }
            }
        });

        console.log('🎯 Sistema de modal configurado');
    }

    async openModal(field, trigger) {
        this.currentField = field;
        this.currentTrigger = trigger;

        // Adicionar classe ativa no trigger
        trigger.classList.add('active');
        trigger.closest('.field-card').classList.add('focus');

        // Atualizar título do modal
        const titles = {
            categoria: '📂 Selecionar Categoria',
            marca: '🏷️ Selecionar Marca', 
            cor: '🎨 Selecionar Cor',
            fornecedor: '🏢 Selecionar Fornecedor',
            grade: '📏 Selecionar Tamanho',
            ncm: '📋 Selecionar NCM'
        };

        document.getElementById('modalTitle').textContent = titles[field] || 'Selecionar Opção';

        // Mostrar modal
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.add('show');

        // Focar no campo de busca após animação
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 300);

        // Carregar dados
        await this.loadModalData(field);
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('show');

        // Limpar busca
        document.getElementById('searchInput').value = '';

        // Remover classes ativas
        if (this.currentTrigger) {
            this.currentTrigger.classList.remove('active');
            this.currentTrigger.closest('.field-card').classList.remove('focus');
        }

        this.currentField = null;
        this.currentTrigger = null;
    }

    isModalOpen() {
        return document.getElementById('modalOverlay').classList.contains('show');
    }

    async loadModalData(field) {
        const container = document.getElementById('optionsContainer');
        
        // Mostrar loading
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-text">Carregando opções...</div>
            </div>
        `;

        // Simular delay de carregamento para efeito visual
        await this.delay(600);

        // Obter dados
        const currentData = this.dropdownData[field] || [];

        // Renderizar opções
        this.renderModalOptions(currentData);
    }

    renderModalOptions(data) {
        const container = document.getElementById('optionsContainer');
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M16 16l-4-4-4 4"/>
                        <path d="M12 8v8"/>
                    </svg>
                    <div class="no-results-text">Nenhuma opção encontrada</div>
                    <div class="no-results-subtitle">Verifique se existem dados cadastrados</div>
                </div>
            `;
            return;
        }

        const optionsHtml = data.map((item, index) => `
            <div class="option-item" data-value="${item.value}" style="animation-delay: ${index * 0.05}s">
                <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="option-text">${item.label}</span>
            </div>
        `).join('');

        container.innerHTML = optionsHtml;

        // Adicionar event listeners
        container.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const label = option.querySelector('.option-text').textContent;
                this.selectOption(value, label);
            });

            // Hover effect com som opcional
            option.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }

    filterOptions(query) {
        if (!this.currentField) return;

        const data = this.dropdownData[this.currentField] || [];
        let filtered = data;

        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            filtered = data.filter(item => 
                item.label.toLowerCase().includes(lowerQuery) ||
                item.value.toLowerCase().includes(lowerQuery)
            );
        }

        this.renderModalOptions(filtered);
    }

    selectOption(value, label) {
        if (!this.currentField || !this.currentTrigger) return;

        // Armazenar valor selecionado
        this.selectedValues[this.currentField] = { value, label };

        // Atualizar visual do trigger
        const valueSpan = this.currentTrigger.querySelector('.select-value');
        valueSpan.textContent = label;
        valueSpan.classList.add('selected');

        // Atualizar input hidden
        const hiddenInput = document.getElementById(this.currentField);
        if (hiddenInput) {
            hiddenInput.value = value;
        }

        // Adicionar classe de sucesso
        const fieldCard = this.currentTrigger.closest('.field-card');
        fieldCard.classList.add('success');

        // Mostrar animação de confirmação
        this.showSelectionAnimation();

        // Fechar modal após animação
        setTimeout(() => {
            this.closeModal();
        }, 800);

        console.log(`✅ ${this.currentField} selecionado:`, { value, label });
    }

    showSelectionAnimation() {
        // Criar elemento de confirmação
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #22c55e, #16a34a); color: white;
            padding: 20px 30px; border-radius: 20px; font-weight: 600;
            box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3); z-index: 1000000;
            opacity: 0; animation: confirmationPop 0.8s ease-out forwards;
        `;

        confirmation.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <span>Selecionado com sucesso!</span>
            </div>
        `;

        // Adicionar CSS da animação se não existir
        if (!document.querySelector('#confirmationCSS')) {
            const style = document.createElement('style');
            style.id = 'confirmationCSS';
            style.textContent = `
                @keyframes confirmationPop {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(confirmation);

        // Remover após animação
        setTimeout(() => {
            confirmation.remove();
        }, 800);
    }

    playHoverSound() {
        // Som sutil de hover (opcional)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silenciosamente ignorar se não suportar áudio
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== INTERFACE E FUNCIONALIDADES ORIGINAIS ==========
    setupInterface() {
        // Form submission
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Auto-calculate checkbox
        const autoToggle = document.getElementById('autoToggle');
        if (autoToggle) {
            autoToggle.addEventListener('change', () => this.toggleAutoCalculate());
        }

        // Input validations
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Number formatting with comma support
        const precoInputs = ['precocusto', 'preco'];
        precoInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => this.formatPriceWithComma(e));
                input.addEventListener('blur', (e) => this.validatePriceInput(e));
            }
        });

        // Percentage input formatting
        const margemInput = document.getElementById('margem');
        if (margemInput) {
            margemInput.addEventListener('input', (e) => this.formatPercentage(e));
        }

        console.log('✅ Interface configurada');
    }

    setupPriceCalculation() {
        const precocustoInput = document.getElementById('precocusto');
        const margemInput = document.getElementById('margem');

        if (precocustoInput) {
            precocustoInput.addEventListener('input', () => this.calculatePrice());
        }

        if (margemInput) {
            margemInput.addEventListener('input', () => this.calculatePrice());
        }
    }

    toggleAutoCalculate() {
        const checkbox = document.getElementById('autoToggle');
        const marginField = document.getElementById('marginField');

        this.autoCalculateEnabled = checkbox.checked;

        if (marginField) {
            marginField.style.display = this.autoCalculateEnabled ? 'flex' : 'none';
        }

        if (this.autoCalculateEnabled) {
            this.calculatePrice();
        }
    }

    calculatePrice() {
        if (!this.autoCalculateEnabled) return;

        const precocusto = this.parsePrice(document.getElementById('precocusto')?.value) || 0;
        const margem = parseFloat(document.getElementById('margem')?.value) || 100;

        if (precocusto <= 0) return;

        // Calcular valores
        const margemDecimal = margem / 100;
        const precoCalculado = precocusto * (1 + margemDecimal);
        const precoArredondado = this.roundPrice(precoCalculado);

        // Atualizar campo de preço mantendo vírgula brasileira
        const precoInput = document.getElementById('preco');
        if (precoInput) {
            precoInput.value = precoArredondado.toFixed(2).replace('.', ',');
        }
    }

    roundPrice(price) {
        // Arredondamento inteligente
        const integerPart = Math.floor(price);
        const decimalPart = price - integerPart;
        
        if (decimalPart <= 0.05) {
            return integerPart;
        } else if (decimalPart <= 0.25) {
            return integerPart + 0.20;
        } else if (decimalPart <= 0.45) {
            return integerPart + 0.40;
        } else if (decimalPart <= 0.65) {
            return integerPart + 0.50;
        } else if (decimalPart <= 0.85) {
            return integerPart + 0.80;
        } else {
            return integerPart + 1;
        }
    }

    formatPriceWithComma(e) {
        let value = e.target.value;
        
        // Remove tudo exceto números, vírgulas e pontos
        value = value.replace(/[^\d,\.]/g, '');
        
        // Se tem vírgula, trabalha com vírgula
        if (value.includes(',')) {
            const parts = value.split(',');
            if (parts.length > 2) {
                value = parts[0] + ',' + parts[1];
            }
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + ',' + parts[1].substring(0, 2);
            }
        } 
        // Se tem ponto, trabalha com ponto
        else if (value.includes('.')) {
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts[1];
            }
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }
        
        e.target.value = value;
        
        // Recalcular se auto-calculate estiver ativo
        if (this.autoCalculateEnabled && e.target.id === 'precocusto') {
            this.calculatePrice();
        }
    }

    validatePriceInput(e) {
        let value = e.target.value;
        
        if (!value) return;
        
        // Converte vírgula para ponto para validação
        let numValue = parseFloat(value.replace(',', '.'));
        
        if (isNaN(numValue) || numValue < 0) {
            e.target.value = '';
            return;
        }
        
        // Formata com 2 casas decimais mantendo o separador original
        if (value.includes(',')) {
            e.target.value = numValue.toFixed(2).replace('.', ',');
        } else {
            e.target.value = numValue.toFixed(2);
        }
    }

    formatPercentage(e) {
        let value = e.target.value;
        
        // Remove tudo exceto números
        value = value.replace(/[^\d]/g, '');
        
        // Limita a 3 dígitos (máximo 999%)
        if (value.length > 3) {
            value = value.substring(0, 3);
        }
        
        e.target.value = value;
        
        // Recalcular se auto-calculate estiver ativo
        if (this.autoCalculateEnabled) {
            this.calculatePrice();
        }
    }

    validateField(input) {
        const card = input.closest('.field-card');
        if (!card) return true;

        card.classList.remove('success', 'error');
        const value = input.value.trim();
        const required = input.hasAttribute('required');

        if (required && !value) {
            card.classList.add('error');
            return false;
        }
        if (value) {
            card.classList.add('success');
        }
        return true;
    }

    clearFieldError(input) {
        const card = input.closest('.field-card');
        if (card) {
            card.classList.remove('error');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showToast('Corrija os erros no formulário', 'error');
            return;
        }

        try {
            this.setFormLoading(true);
            const data = this.collectFormData();
            await this.saveProduct(data);
            this.showToast('Produto cadastrado com sucesso!', 'success');
            this.clearForm();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.showToast('Erro ao salvar produto', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    validateForm() {
        const inputs = document.querySelectorAll('input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    collectFormData() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        const data = {};

        // Campos obrigatórios
        data.descricao = formData.get('descricao')?.trim() || '';
        data.quantidade = parseInt(formData.get('quantidade')) || 0;
        
        // Converter preços
        const precocustoText = formData.get('precocusto') || '0';
        const precoText = formData.get('preco') || '0';
        
        data.precocusto = this.parsePrice(precocustoText);
        data.preco = this.parsePrice(precoText);

        // Campos de dropdown (hidden inputs)
        const dropdownFields = ['categoria', 'marca', 'cor', 'grade', 'ncm', 'fornecedor'];
        dropdownFields.forEach(field => {
            const hiddenInput = document.getElementById(field);
            if (hiddenInput && hiddenInput.value) {
                data[field] = hiddenInput.value;
            }
        });

        // Campos opcionais
        const optionalFields = ['codigo', 'peso', 'dimensoes', 'estoqminimo', 'observacoes'];
        
        optionalFields.forEach(field => {
            const value = formData.get(field);
            if (value !== null && value.trim() !== '') {
                if (field === 'peso' || field === 'estoqminimo') {
                    data[field] = parseFloat(value.toString().replace(',', '.')) || 0;
                } else {
                    data[field] = value.trim();
                }
            }
        });

        // Adicionar usuário logado
        if (this.currentUser) {
            data.user = this.currentUser.id;
        }

        console.log('Dados coletados para Supabase:', data);
        return data;
    }

    async saveProduct(data) {
        if (!this.supabase) {
            throw new Error('Supabase não inicializado');
        }

        const { error } = await this.supabase.from('cadastro').insert([data]);
        
        if (error) {
            throw error;
        }
    }

    clearForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
            
            // Limpar estados visuais
            document.querySelectorAll('.field-card').forEach(card => {
                card.classList.remove('success', 'error');
            });

            // Resetar modal triggers
            document.querySelectorAll('.modal-select-trigger').forEach(trigger => {
                const valueSpan = trigger.querySelector('.select-value');
                const placeholder = valueSpan.dataset.placeholder;
                
                valueSpan.textContent = placeholder;
                valueSpan.classList.remove('selected');
                trigger.classList.remove('active');
            });

            // Resetar hidden inputs
            document.querySelectorAll('input[type="hidden"]').forEach(input => {
                input.value = '';
            });

            // Resetar auto-calculate
            const checkbox = document.getElementById('autoToggle');
            const marginField = document.getElementById('marginField');
            
            if (checkbox) {
                checkbox.checked = false;
            }
            if (marginField) {
                marginField.style.display = 'none';
            }
            
            this.autoCalculateEnabled = false;
            this.selectedValues = {};
        }
    }

    handleCancel() {
        if (this.hasUnsavedChanges()) {
            if (confirm('Existem alterações não salvas. Deseja cancelar?')) {
                this.clearForm();
                if (window.history.length > 1) {
                    window.history.back();
                }
            }
        }
    }

    hasUnsavedChanges() {
        const form = document.getElementById('productForm');
        if (!form) return false;
        
        return Array.from(form.querySelectorAll('input, textarea')).some(input => 
            input.value.trim() !== ''
        );
    }

    setFormLoading(loading) {
        const form = document.getElementById('productForm');
        const btn = document.getElementById('saveBtn');
        
        if (form) {
            form.classList.toggle('loading', loading);
        }
        
        if (btn) {
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    Salvando...
                `;
            } else {
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    Salvar Produto
                `;
            }
        }
    }

    parsePrice(value) {
        if (!value) return 0;
        
        if (typeof value === 'string') {
            const cleanValue = value.trim().replace(',', '.');
            const numValue = parseFloat(cleanValue);
            return isNaN(numValue) ? 0 : numValue;
        }
        
        const numValue = parseFloat(value);
        return isNaN(numValue) ? 0 : numValue;
    }

    showToast(message, type = 'info', duration = 4000) {
        // Remove toasts anteriores
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ========== API PÚBLICA ==========
    getSelectedValues() {
        return this.selectedValues;
    }

    clearSelections() {
        this.selectedValues = {};
        this.clearForm();
    }

    setFieldValue(field, value, label) {
        const trigger = document.querySelector(`[data-field="${field}"]`);
        if (trigger) {
            const valueSpan = trigger.querySelector('.select-value');
            valueSpan.textContent = label;
            valueSpan.classList.add('selected');
            trigger.closest('.field-card').classList.add('success');
            
            const hiddenInput = document.getElementById(field);
            if (hiddenInput) {
                hiddenInput.value = value;
            }
            
            this.selectedValues[field] = { value, label };
        }
    }
}

// ========== FUNÇÕES GLOBAIS ==========

function toggleAdditionalFields() {
    const section = document.getElementById('optionalSection');
    const button = document.querySelector('.btn-settings');
    const toggleText = document.getElementById('toggleText');
    
    if (section && button && toggleText) {
        const isHidden = section.classList.contains('hidden');
        
        if (isHidden) {
            section.classList.remove('hidden');
            section.classList.add('show');
            toggleText.textContent = 'Ocultar Campos Extras';
        } else {
            section.classList.add('hidden');
            section.classList.remove('show');
            toggleText.textContent = 'Mostrar Campos Extras';
        }
    }
}

function clearForm() {
    if (window.productRegistrationModal) {
        window.productRegistrationModal.clearForm();
    }
}

function handleCancel() {
    if (window.productRegistrationModal) {
        window.productRegistrationModal.handleCancel();
    }
}

// ========== INICIALIZAÇÃO ==========

let productRegistrationModal;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        productRegistrationModal = new ModernProductRegistrationWithModal();
    });
} else {
    productRegistrationModal = new ModernProductRegistrationWithModal();
}

// ========== API PÚBLICA ==========

window.ProductRegistrationModal = {
    getInstance: () => productRegistrationModal,
    showToast: (msg, type) => productRegistrationModal?.showToast(msg, type),
    clearForm: () => productRegistrationModal?.clearForm(),
    getSelectedValues: () => productRegistrationModal?.getSelectedValues() || {},
    setFieldValue: (field, value, label) => productRegistrationModal?.setFieldValue(field, value, label),
    toggleAdditionalFields: toggleAdditionalFields
};

window.productRegistrationModal = productRegistrationModal;

// ========== PROTEÇÃO CONTRA PERDA DE DADOS ==========

window.addEventListener('beforeunload', (e) => {
    if (productRegistrationModal?.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'Alterações não salvas serão perdidas. Deseja sair?';
        return e.returnValue;
    }
});

// ========== ANIMAÇÕES DE ENTRADA ==========

document.addEventListener('DOMContentLoaded', () => {
    // Animação dos field cards ao carregar
    setTimeout(() => {
        document.querySelectorAll('.field-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 500);

    // Efeito de hover nos botões
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-settings').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animação nos modal triggers
    document.querySelectorAll('.modal-select-trigger').forEach(trigger => {
        trigger.addEventListener('mouseenter', () => {
            trigger.style.transform = 'translateY(-1px)';
        });
        
        trigger.addEventListener('mouseleave', () => {
            if (!trigger.classList.contains('active')) {
                trigger.style.transform = 'translateY(0)';
            }
        });
    });
});

// ========== LOG DE INICIALIZAÇÃO ==========

console.log('🚀 Sistema de Cadastro de Produtos com Modal Moderno carregado!');
console.log('📦 Funcionalidades:');
console.log('   ✅ Modal centralizado ultra moderno');
console.log('   ✅ Busca em tempo real nos dropdowns');
console.log('   ✅ Animações fluidas e efeitos visuais');
console.log('   ✅ Confirmação visual de seleção');
console.log('   ✅ Efeitos sonoros opcionais');
console.log('   ✅ Suporte completo a teclado (ESC, Enter)');
console.log('   ✅ Precificação automática inteligente');
console.log('   ✅ Integração com Supabase');
console.log('   ✅ Validação em tempo real');
console.log('   ✅ Proteção contra perda de dados');
console.log('   ✅ Interface responsiva premium');
console.log('   ✅ Design glassmorphism com backdrop-blur');
console.log('   ✅ Toast notifications modernas');
console.log('   ✅ API pública para integração');

// ========== EASTER EGG - SEQUÊNCIA KONAMI ==========

let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length) {
        if (konamiCode.every((code, index) => code === konamiSequence[index])) {
            // Ativar modo especial
            document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd)';
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.animation = 'rainbow 3s ease infinite';
            
            // Adicionar CSS da animação rainbow
            if (!document.querySelector('#rainbowCSS')) {
                const style = document.createElement('style');
                style.id = 'rainbowCSS';
                style.textContent = `
                    @keyframes rainbow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            if (productRegistrationModal) {
                productRegistrationModal.showToast('🎉 Modo Rainbow ativado! Konami Code detectado!', 'success');
            }
            
            // Voltar ao normal após 10 segundos
            setTimeout(() => {
                document.body.style.background = '';
                document.body.style.backgroundSize = '';
                document.body.style.animation = '';
                
                if (productRegistrationModal) {
                    productRegistrationModal.showToast('Modo normal restaurado', 'info');
                }
            }, 10000);
            
            konamiCode = [];
        }
    }
});

console.log('🎮 Easter egg disponível: Tente o Konami Code!');
console.log('💡 Dica: ↑↑↓↓←→←→BA');