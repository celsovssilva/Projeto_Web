function mostrarModal(btn) {
    const maxTickets = Number(btn.dataset.maxTickets);
    const ticketsSold = Number(btn.dataset.ticketsSold);
    const ingressosDisponiveis = maxTickets - ticketsSold;

    const elementos = {
        'eventName': { valor: btn.dataset.name },
        'eventDate': { valor: btn.dataset.date },
        'ticketDeadline': { valor: btn.dataset.deadline },
        'eventDescription': { valor: btn.dataset.description || 'Sem descrição disponível' },
        'eventLocation': { valor: btn.dataset.location },
        'eventPrice': { valor: `R$ ${btn.dataset.price}` },
        'availableTickets': { valor: `${ingressosDisponiveis} Unidades` }
    };

    Object.entries(elementos).forEach(([id, config]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = config.valor;
        }
    });

    // Salva o ID do evento globalmente para usar na compra
    window.eventoSelecionadoId = btn.dataset.id;

    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'block';
    modal.style.display = 'block';

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
    });
}

function fecharModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    
    if (!modal || !overlay) return;

    overlay.classList.remove('active');
    modal.classList.remove('active');

    setTimeout(() => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }, 200);
}

function showToast(message, type = 'error') {
    // Remove toast antigo se existir
    const oldToast = document.getElementById('custom-toast');
    if (oldToast) oldToast.remove();

    // Cria o toast
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.className = `custom-toast custom-toast-${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Remover após 4s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function comprarIngresso() {
    const eventId = window.eventoSelecionadoId;
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Você precisa estar logado para comprar! Redirecionando...', 'warning');
        setTimeout(() => {
            window.location.href = '/api/login';
        }, 1800);
        return;
    }

    fetch(`/api/comprar/${eventId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            showToast(data.message, 'success');
            
            const availableTicketsSpan = document.getElementById('availableTickets');
            if (availableTicketsSpan) {
                const texto = availableTicketsSpan.textContent;
                const quantidade = parseInt(texto);
                if (!isNaN(quantidade) && quantidade > 0) {
                    availableTicketsSpan.textContent = `${quantidade - 1} Unidades`;
                }
            }
            const btn = document.querySelector(`button[data-id="${eventId}"]`);
            if (btn) {
                const ticketsSold = Number(btn.dataset.ticketsSold) + 1;
                btn.dataset.ticketsSold = ticketsSold;

                const card = btn.closest('.event-card');
                if (card) {
                    const ingressosDisponiveis = Number(btn.dataset.maxTickets) - ticketsSold;
                    const displayIngressos = card.querySelector('.ingressos-disponiveis');
                    if (displayIngressos) {
                        displayIngressos.textContent = `${ingressosDisponiveis} ingressos disponíveis`;
                    }
                }
            }

            if (!data.emailEnviado) {
                setTimeout(() => {
                    showToast('Verifique seu e-mail ou entre em contato com suporte', 'warning');
                }, 1500);
            }
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro na compra:', error);
        showToast('Erro ao processar a compra.', 'error');
    });
}

function normalizar(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', fecharModal);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            fecharModal();
        }
    });

    function realizarBusca() {
        const nome = normalizar(document.getElementById('buscaNome').value);
        const cidade = normalizar(document.getElementById('buscaCidade').value);

        document.querySelectorAll('.event-card').forEach(card => {
            const nomeEvento = normalizar(card.querySelector('h3').textContent);
            const cidadeEvento = normalizar(card.getAttribute('data-cidade') || '');

            const matchNome = nome === '' || nomeEvento.includes(nome);
            const matchCidade = cidade === '' || cidadeEvento.includes(cidade);

            card.style.display = (matchNome && matchCidade) ? '' : 'none';
        });
    }

    const buscaNome = document.getElementById('buscaNome');
    const buscaCidade = document.getElementById('buscaCidade');

    let timeoutId;
    function debounceBusca() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(realizarBusca, 300);o
    }

    buscaNome.addEventListener('input', debounceBusca);
    buscaCidade.addEventListener('input', debounceBusca);

    document.getElementById('filtroEventos').addEventListener('submit', e => {
        e.preventDefault();
    });
});