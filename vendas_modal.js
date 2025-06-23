class VendasModalSystem {
    constructor() {
        this.currentItemDiscountIndex = null;
        this.init();
    }

    init() {
        this.setupModalEvents();
        console.log('🎯 Sistema de modais carregado');
    }

    setupModalEvents() {
        this.setupCardModalEvents();
        this.setupCrediarioModalEvents();
        this.setupItemDiscountModalEvents();
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal(overlay.id);
            });
        });
    }

    setupCardModalEvents() {
        document.getElementById('cardMachine')?.addEventListener('change', () => this.updateCardCalculations());

        document.querySelectorAll('#installmentsGrid .installment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('#installmentsGrid .installment-option').forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.updateCardCalculations();
            });
        });

        document.querySelectorAll('.card-fee-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.card-fee-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCardCalculations();
            });
        });
    }

    setupCrediarioModalEvents() {
        ['crediarioCustomerName', 'crediarioCustomerPhone', 'crediarioCustomerCpf'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updateCrediarioCalculations());
        });

        document.querySelectorAll('#crediarioInstallmentsGrid .installment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('#crediarioInstallmentsGrid .installment-option').forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.updateCrediarioCalculations();
            });
        });

        document.querySelectorAll('.crediario-interest-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.crediario-interest-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const interestInput = document.getElementById('interestInput');
                if (e.target.dataset.interest === 'yes') {
                    interestInput.style.display = 'block';
                } else {
                    interestInput.style.display = 'none';
                    document.getElementById('interestRate').value = '';
                }
                this.updateCrediarioCalculations();
            });
        });

        document.querySelectorAll('.crediario-fee-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.crediario-fee-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCrediarioCalculations();
            });
        });

        document.getElementById('interestRate')?.addEventListener('input', () => this.updateCrediarioCalculations());
    }

    // ========== SETUP MODAL DESCONTO POR ITEM ==========
    setupItemDiscountModalEvents() {
        // Toggle tipo de desconto
        document.querySelectorAll('#itemDiscountModal .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#itemDiscountModal .toggle-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateItemDiscountPreview();
            });
        });

        // Input do valor
        document.getElementById('itemDiscountInput')?.addEventListener('input', () => {
            this.updateItemDiscountPreview();
        });
    }

    // ========== MODAL DESCONTO POR ITEM ==========
    openItemDiscountModal(index) {
        const sale = window.VendasSystem?.getCurrentSale();
        if (!sale || !sale.items[index]) return;
        
        this.currentItemDiscountIndex = index;
        const item = sale.items[index];
        
        // Atualizar título do modal
        document.getElementById('itemDiscountProductName').textContent = item.nome;
        
        // Reset do modal
        document.querySelectorAll('#itemDiscountModal .toggle-btn').forEach(btn => 
            btn.classList.remove('active'));
        document.querySelector('#itemDiscountModal .toggle-btn[data-type="percent"]').classList.add('active');
        
        document.getElementById('itemDiscountInput').value = '';
        document.getElementById('itemDiscountPreview').style.display = 'none';
        document.getElementById('itemDiscountApplyBtn').disabled = true;
        
        this.showModal('itemDiscountModal');
    }

    updateItemDiscountPreview() {
        if (this.currentItemDiscountIndex === null) return;
        
        const sale = window.VendasSystem?.getCurrentSale();
        if (!sale) return;
        
        const item = sale.items[this.currentItemDiscountIndex];
        const discountType = document.querySelector('#itemDiscountModal .toggle-btn.active')?.dataset.type;
        const discountValue = parseFloat(document.getElementById('itemDiscountInput').value) || 0;
        
        if (discountValue <= 0) {
            document.getElementById('itemDiscountPreview').style.display = 'none';
            document.getElementById('itemDiscountApplyBtn').disabled = true;
            return;
        }
        
        let discountAmount = 0;
        const originalPrice = item.precoOriginal || item.preco;
        
        if (discountType === 'percent') {
            const maxPercent = 90;
            const percent = Math.min(discountValue, maxPercent);
            discountAmount = (originalPrice * percent) / 100;
        } else {
            const maxValue = originalPrice * 0.9;
            discountAmount = Math.min(discountValue, maxValue);
        }
        
        const newPrice = Math.max(0.01, originalPrice - discountAmount);
        
        // Atualizar preview
        const fmt = window.VendasSystem?.fmt || ((value) => value.toFixed(2));
        document.getElementById('originalPrice').textContent = `R$ ${fmt(originalPrice)}`;
        document.getElementById('discountAmount').textContent = `- R$ ${fmt(discountAmount)}`;
        document.getElementById('newPrice').textContent = `R$ ${fmt(newPrice)}`;
        
        document.getElementById('itemDiscountPreview').style.display = 'block';
        document.getElementById('itemDiscountApplyBtn').disabled = false;
    }

    applyItemDiscount() {
        if (this.currentItemDiscountIndex === null) return;
        
        const sale = window.VendasSystem?.getCurrentSale();
        if (!sale) return;
        
        const item = sale.items[this.currentItemDiscountIndex];
        const discountType = document.querySelector('#itemDiscountModal .toggle-btn.active')?.dataset.type;
        const discountValue = parseFloat(document.getElementById('itemDiscountInput').value) || 0;
        
        if (discountValue <= 0) return;
        
        // Salvar preço original se não existir
        if (!item.precoOriginal) {
            item.precoOriginal = item.preco;
        }
        
        let discountAmount = 0;
        const originalPrice = item.precoOriginal;
        
        if (discountType === 'percent') {
            const maxPercent = 90;
            const percent = Math.min(discountValue, maxPercent);
            discountAmount = (originalPrice * percent) / 100;
        } else {
            const maxValue = originalPrice * 0.9;
            discountAmount = Math.min(discountValue, maxValue);
        }
        
        const newPrice = Math.max(0.01, originalPrice - discountAmount);
        
        // Aplicar desconto
        item.preco = newPrice;
        item.desconto = { type: discountType, value: discountValue };
        
        this.closeModal('itemDiscountModal');
        
        // Atualizar a interface
        if (window.VendasSystem?.render) window.VendasSystem.render();
        if (window.VendasSystem?.calculate) window.VendasSystem.calculate();
        
        const discText = discountType === 'percent' 
            ? `${discountValue}%` 
            : `R$ ${window.VendasSystem?.fmt(discountValue) || discountValue.toFixed(2)}`;
        
        if (window.VendasSystem?.showToast) {
            window.VendasSystem.showToast(`Desconto de ${discText} aplicado em ${item.nome}`, 'success');
        }
    }

    openCardModal() {
        const sale = window.VendasSystem?.getCurrentSale();
        if (!sale || sale.items.length === 0) {
            if (window.VendasSystem?.showToast) {
                window.VendasSystem.showToast('Adicione produtos à venda', 'warning');
            }
            return;
        }
        
        const modal = document.getElementById('cardModal');
        if (!modal) return;
        
        document.getElementById('cardMachine').value = '';
        document.querySelectorAll('#installmentsGrid .installment-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.card-fee-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.card-fee-toggle .toggle-btn[data-payer="cliente"]').classList.add('active');
        document.getElementById('cardFeeInfo').style.display = 'none';
        document.getElementById('cardCompleteBtn').disabled = true;
        
        this.showModal('cardModal');
    }

    openCrediarioModal() {
        const sale = window.VendasSystem?.getCurrentSale();
        if (!sale || sale.items.length === 0) {
            if (window.VendasSystem?.showToast) {
                window.VendasSystem.showToast('Adicione produtos à venda', 'warning');
            }
            return;
        }
        
        const modal = document.getElementById('crediarioModal');
        if (!modal) return;
        
        const customerName = document.getElementById('customerName')?.value || '';
        const customerPhone = document.getElementById('customerPhone')?.value || '';
        const customerCpf = document.getElementById('customerCpf')?.value || '';
        
        document.getElementById('crediarioCustomerName').value = customerName;
        document.getElementById('crediarioCustomerPhone').value = customerPhone;
        document.getElementById('crediarioCustomerCpf').value = customerCpf;
        
        document.querySelectorAll('#crediarioInstallmentsGrid .installment-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.crediario-interest-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.crediario-interest-toggle .toggle-btn[data-interest="no"]').classList.add('active');
        document.querySelectorAll('.crediario-fee-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.crediario-fee-toggle .toggle-btn[data-payer="cliente"]').classList.add('active');
        
        document.getElementById('interestInput').style.display = 'none';
        document.getElementById('interestRate').value = '';
        document.getElementById('crediarioFeeInfo').style.display = 'none';
        document.getElementById('crediarioCompleteBtn').disabled = true;
        
        this.showModal('crediarioModal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
        if (modalId === 'itemDiscountModal') this.currentItemDiscountIndex = null;
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('show'));
        this.currentItemDiscountIndex = null;
    }

    updateCardCalculations() {
        const machine = document.getElementById('cardMachine').value;
        const selectedInstallment = document.querySelector('#installmentsGrid .installment-option.selected');
        const feePayer = document.querySelector('.card-fee-toggle .toggle-btn.active')?.dataset.payer;
        
        if (!machine || !selectedInstallment || !feePayer) {
            document.getElementById('cardFeeInfo').style.display = 'none';
            document.getElementById('cardCompleteBtn').disabled = true;
            return;
        }
        
        const installments = parseInt(selectedInstallment.dataset.installments);
        const cardMachines = window.VendasSystem?.getCardMachines();
        const saleTotal = window.VendasSystem?.calculateSaleTotal();
        
        if (!cardMachines || !saleTotal) return;
        
        const machineData = cardMachines[machine];
        const feePercentage = installments === 1 ? machineData.feeDebit : machineData.feeCredit;
        const machineFee = (saleTotal * feePercentage) / 100;
        
        let interestFee = 0;
        if (installments > 3) {
            interestFee = (saleTotal * (installments - 3) * 0.5) / 100;
        }
        
        const totalFees = machineFee + interestFee;
        let totalForClient, totalForStore;
        
        if (feePayer === 'cliente') {
            totalForClient = saleTotal + totalFees;
            totalForStore = saleTotal;
        } else {
            totalForClient = saleTotal;
            totalForStore = saleTotal - totalFees;
        }
        
        const fmt = window.VendasSystem?.fmt || ((value) => value.toFixed(2));
        
        document.getElementById('cardSaleValue').textContent = `R$ ${fmt(saleTotal)}`;
        document.getElementById('cardFeeValue').textContent = `R$ ${fmt(machineFee)}`;
        document.getElementById('cardInterestValue').textContent = `R$ ${fmt(interestFee)}`;
        document.getElementById('cardTotalClientValue').textContent = `R$ ${fmt(totalForClient)}`;
        document.getElementById('cardTotalValue').textContent = `R$ ${fmt(totalForStore)}`;
        
        document.getElementById('cardFeeInfo').style.display = 'block';
        document.getElementById('cardCompleteBtn').disabled = false;
    }

    updateCrediarioCalculations() {
        const customerName = document.getElementById('crediarioCustomerName').value.trim();
        const selectedInstallment = document.querySelector('#crediarioInstallmentsGrid .installment-option.selected');
        const hasInterest = document.querySelector('.crediario-interest-toggle .toggle-btn.active')?.dataset.interest === 'yes';
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
        const feePayer = document.querySelector('.crediario-fee-toggle .toggle-btn.active')?.dataset.payer;
        
        if (!customerName || !selectedInstallment || !feePayer) {
            document.getElementById('crediarioFeeInfo').style.display = 'none';
            document.getElementById('crediarioCompleteBtn').disabled = true;
            return;
        }
        
        const installments = parseInt(selectedInstallment.dataset.installments);
        const saleTotal = window.VendasSystem?.calculateSaleTotal();
        
        if (!saleTotal) return;
        
        let interestAmount = 0;
        if (hasInterest && interestRate > 0) {
            interestAmount = (saleTotal * interestRate * installments) / 100;
        }
        
        let totalForClient, totalForStore, installmentValue;
        
        if (feePayer === 'cliente') {
            totalForClient = saleTotal + interestAmount;
            totalForStore = saleTotal;
            installmentValue = totalForClient / installments;
        } else {
            totalForClient = saleTotal;
            totalForStore = saleTotal;
            installmentValue = totalForClient / installments;
        }
        
        const fmt = window.VendasSystem?.fmt || ((value) => value.toFixed(2));
        
        document.getElementById('crediarioSaleValue').textContent = `R$ ${fmt(saleTotal)}`;
        document.getElementById('crediarioInterestValue').textContent = `R$ ${fmt(interestAmount)}`;
        document.getElementById('crediarioTotalClientValue').textContent = `R$ ${fmt(totalForClient)}`;
        document.getElementById('crediarioInstallmentValue').textContent = `R$ ${fmt(installmentValue)}`;
        document.getElementById('crediarioTotalValue').textContent = `R$ ${fmt(totalForStore)}`;
        
        document.getElementById('crediarioFeeInfo').style.display = 'block';
        document.getElementById('crediarioCompleteBtn').disabled = false;
    }

    completeCardSale() {
        const machine = document.getElementById('cardMachine').value;
        const selectedInstallment = document.querySelector('#installmentsGrid .installment-option.selected');
        const feePayer = document.querySelector('.card-fee-toggle .toggle-btn.active')?.dataset.payer;
        
        if (!machine || !selectedInstallment || !feePayer) {
            if (window.VendasSystem?.showToast) {
                window.VendasSystem.showToast('Preencha todos os campos', 'warning');
            }
            return;
        }
        
        const installments = parseInt(selectedInstallment.dataset.installments);
        const cardMachines = window.VendasSystem?.getCardMachines();
        
        if (!cardMachines) return;
        
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.payment-option[data-method="cartao"]').classList.add('selected');
        
        // Atualizar o sale object através da API pública
        const sale = window.VendasSystem?.getCurrentSale();
        if (sale) {
            sale.paymentMethod = 'cartao';
            sale.paymentDetails = { 
                machine, 
                installments, 
                feePayer, 
                machineData: cardMachines[machine] 
            };
        }
        
        this.closeModal('cardModal');
        
        if (window.VendasSystem?.showToast) {
            window.VendasSystem.showToast(
                `Cartão configurado: ${installments}x na ${cardMachines[machine].name} (${feePayer} paga taxas)`, 
                'success'
            );
        }
        
        if (window.VendasSystem?.validate) window.VendasSystem.validate();
        
        // Auto finalizar após configurar cartão
        setTimeout(() => {
            if (window.vendasSystem?.complete) {
                window.vendasSystem.complete();
            }
        }, 500);
    }

    completeCrediarioSale() {
        const customerName = document.getElementById('crediarioCustomerName').value.trim();
        const customerPhone = document.getElementById('crediarioCustomerPhone').value.trim();
        const customerCpf = document.getElementById('crediarioCustomerCpf').value.trim();
        const selectedInstallment = document.querySelector('#crediarioInstallmentsGrid .installment-option.selected');
        const hasInterest = document.querySelector('.crediario-interest-toggle .toggle-btn.active')?.dataset.interest === 'yes';
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
        const feePayer = document.querySelector('.crediario-fee-toggle .toggle-btn.active')?.dataset.payer;
        
        if (!customerName || !selectedInstallment || !feePayer) {
            if (window.VendasSystem?.showToast) {
                window.VendasSystem.showToast('Preencha nome do cliente e selecione as parcelas', 'warning');
            }
            return;
        }
        
        const installments = parseInt(selectedInstallment.dataset.installments);
        
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.payment-option[data-method="crediario"]').classList.add('selected');
        
        // Atualizar o sale object através da API pública
        const sale = window.VendasSystem?.getCurrentSale();
        if (sale) {
            sale.paymentMethod = 'crediario';
            sale.paymentDetails = { 
                customerName, 
                customerPhone, 
                customerCpf, 
                installments, 
                hasInterest, 
                interestRate: hasInterest ? interestRate : 0, 
                feePayer 
            };
            
            sale.customer.nome = customerName;
            sale.customer.telefone = customerPhone;
            sale.customer.cpf = customerCpf;
        }
        
        // Atualizar campos do cliente na interface
        if (!document.getElementById('customerName').value) document.getElementById('customerName').value = customerName;
        if (!document.getElementById('customerPhone').value) document.getElementById('customerPhone').value = customerPhone;
        if (!document.getElementById('customerCpf').value) document.getElementById('customerCpf').value = customerCpf;
        
        this.closeModal('crediarioModal');
        
        if (window.VendasSystem?.showToast) {
            window.VendasSystem.showToast(
                `Crediário configurado: ${installments}x para ${customerName} (${feePayer} paga juros)`, 
                'success'
            );
        }
        
        if (window.VendasSystem?.validate) window.VendasSystem.validate();
        
        // Auto finalizar após configurar crediário
        setTimeout(() => {
            if (window.vendasSystem?.complete) {
                window.vendasSystem.complete();
            }
        }, 500);
    }
}

// ========== INICIALIZAÇÃO ==========
let vendasModalSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando VendasModalSystem...');
    vendasModalSystem = new VendasModalSystem();
});

// ========== FUNÇÕES GLOBAIS PARA MODAIS ==========
window.VendasModalSystem = {
    openCardModal: () => vendasModalSystem?.openCardModal(),
    openCrediarioModal: () => vendasModalSystem?.openCrediarioModal(),
    openItemDiscountModal: (index) => vendasModalSystem?.openItemDiscountModal(index),
    closeModal: (modalId) => vendasModalSystem?.closeModal(modalId),
    closeAllModals: () => vendasModalSystem?.closeAllModals(),
    completeCardSale: () => vendasModalSystem?.completeCardSale(),
    completeCrediarioSale: () => vendasModalSystem?.completeCrediarioSale(),
    applyItemDiscount: () => vendasModalSystem?.applyItemDiscount()
};

// ========== FUNÇÕES GLOBAIS DIRETAS PARA COMPATIBILIDADE ==========
window.closeModal = (modalId) => vendasModalSystem?.closeModal(modalId);
window.completeCardSale = () => vendasModalSystem?.completeCardSale();
window.completeCrediarioSale = () => vendasModalSystem?.completeCrediarioSale();
window.applyItemDiscount = () => vendasModalSystem?.applyItemDiscount();
window.openItemDiscountModal = (index) => vendasModalSystem?.openItemDiscountModal(index);

console.log('🎯 Sistema de modais carregado e exportado para window.VendasModalSystem');