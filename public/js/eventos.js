function mostrarModal(btn) {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    
    if (!modal || !overlay) return;

    const elementos = {
        'eventName': { valor: btn.dataset.name },
        'eventDate': { valor: btn.dataset.date },
        'ticketDeadline': { valor: btn.dataset.deadline },
        'eventDescription': { valor: btn.dataset.description || 'Sem descrição disponível' },
        'eventLocation': { valor: btn.dataset.location },
        'eventPrice': { valor: `R$ ${btn.dataset.price}` },
        'availableTickets': { valor: `${btn.dataset.maxTickets} ingressos` }
    };

    Object.entries(elementos).forEach(([id, config]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = config.valor;
        }
    });

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

function comprarIngresso() {
    alert('Funcionalidade de compra em desenvolvimento!');
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
});