// ========== CONFIGURAÇÃO SUPABASE ==========
const SUPABASE_URL = 'https://duupmyhbsvitadcnkchq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dXBteWhic3ZpdGFkY25rY2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDU1MjUsImV4cCI6MjA2MzQ4MTUyNX0.bFqBc0rEEbZXBKfsK6onBuxm62FK2NHeW_oBm757wL0';

let supabase;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando sistema SmartBiz...');
    
    // Inicializar Supabase
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado');
    } else {
        console.error('❌ Biblioteca Supabase não carregada');
        return;
    }
    
    // Verificar se já está logado
    await checkExistingSession();
    
    // Configurar interface
    setupInterface();
});

// ========== VERIFICAR SESSÃO EXISTENTE ==========
async function checkExistingSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            console.log('👤 Usuário já logado:', session.user.email);
            showMessage('Você já está logado! Redirecionando...', 'success');
            
            // Salvar dados e redirecionar
            saveUserData(session.user);
            setTimeout(() => {
                window.location.href = 'header.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
}

// ========== CONFIGURAR INTERFACE ==========
function setupInterface() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    
    // Links funcionais
    document.getElementById('forgotPassword')?.addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('Função "Esqueceu a senha" em desenvolvimento', 'info');
    });
    
    document.getElementById('createAccount')?.addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('Função "Criar conta" em desenvolvimento', 'info');
    });
    
    // Input effects
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#4361ee';
            e.target.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.1)';
        });
        
        input.addEventListener('blur', (e) => {
            e.target.style.borderColor = '#e1e5ee';
            e.target.style.boxShadow = 'none';
        });
    });
    
    // Focus no primeiro input
    emailInput?.focus();
    
    console.log('✅ Interface configurada');
}

// ========== HANDLE LOGIN ==========
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('.btn-primary');
    
    // Validações
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, digite um email válido', 'error');
        return;
    }
    
    try {
        // Loading state
        setLoadingState(submitBtn, true, 'Entrando...');
        
        // Fazer login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            console.log('✅ Login realizado com sucesso!');
            showMessage('Login realizado com sucesso!', 'success');
            
            // Salvar dados do usuário
            saveUserData(data.user);
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = 'header.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        
        // Traduzir erros
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        }
        
        showMessage(errorMessage, 'error');
        
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// ========== UTILITÁRIOS ==========
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveUserData(user) {
    try {
        const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('smartbiz_user', JSON.stringify(userData));
        console.log('💾 Dados do usuário salvos');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function setLoadingState(button, loading, text = 'Entrar no Sistema') {
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.textContent = text;
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = 'Entrar no Sistema';
        button.style.opacity = '1';
    }
}

function showMessage(message, type = 'info') {
    // Remove mensagem anterior
    document.querySelectorAll('.login-message').forEach(m => m.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `login-message login-message-${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    messageDiv.style.background = colors[type] || colors.info;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4000);
}

// ========== EXPORTAR PARA HEADER ==========
window.SmartBizAuth = {
    async checkSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return null;
        }
    },
    
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            localStorage.clear();
            console.log('✅ Logout realizado');
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    },
    
    getUserData() {
        try {
            const userData = localStorage.getItem('smartbiz_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            return null;
        }
    }
};

console.log('🔐 Sistema de autenticação SmartBiz carregado');