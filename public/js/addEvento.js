function toggleAddEventFormForNew() {
  document.getElementById("eventForm").reset();
  document.getElementById("eventId").value = "";
  document.getElementById("formTitle").innerText = "Adicionar Novo Evento";
  document.getElementById("formSubmitBtn").innerText = "Salvar Evento";
  document.getElementById("eventForm").action = `/api/admin/events`;
  document.getElementById("addEventForm").style.display = "block";
  document.getElementById("addressSummary").value = "";
}

function cancelEdit() {
  document.getElementById("addEventForm").style.display = "none";
}

function abrirModalEditar(id) {
  const eventData = eventsData.find((e) => e.id === id);
  if (!eventData) {
    alert("Evento não encontrado");
    return;
  }

  document.getElementById("modalEventId").value = eventData.id;
  document.getElementById("modalName").value = eventData.name;
  document.getElementById("modalEventDate").value = new Date(eventData.eventDate)
    .toISOString()
    .slice(0, 16);
  document.getElementById("modalTicketDeadline").value = new Date(eventData.ticketDeadline)
    .toISOString()
    .slice(0, 16);

  const modalTicketPriceEl = document.getElementById("modalTicketPrice");
  const priceInCentsString = Math.round(parseFloat(eventData.ticketPrice || 0) * 100).toString();
  modalTicketPriceEl.value = priceInCentsString;
  formatInputAsCurrency(modalTicketPriceEl);

  document.getElementById("modalDescription").value = eventData.description;
  document.getElementById("modalStreet").value = eventData.street || "";
  document.getElementById("modalNumber").value = eventData.number || "";
  document.getElementById("modalComplement").value = eventData.complement || "";
  document.getElementById("modalNeighborhood").value = eventData.neighborhood || "";
  document.getElementById("modalCity").value = eventData.city || "";
  document.getElementById("modalState").value = eventData.state || "";

  const modalCepEl = document.getElementById("modalCep");
  modalCepEl.value = eventData.cep || "";
  if (modalCepEl.value) {
    modalCepEl.value = formatCEP(modalCepEl.value.replace(/\D/g, ""));
  }

  document.getElementById("modalMaxTickets").value = eventData.maxTickets;
  document.getElementById("modalStatus").value = eventData.status;

  $("#editEventModal").modal("show");
}

function salvarEdicaoEvento() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Sessão expirada ou inválida. Faça login novamente.');
    window.location.href = '/api/login';
    return;
  }

  const modalTicketPriceValue = document.getElementById("modalTicketPrice").value;
  const rawPrice = parseCurrencyValue(modalTicketPriceValue);

  const name = document.getElementById("modalName").value.trim();
  const description = document.getElementById("modalDescription").value.trim();
  const eventDate = document.getElementById("modalEventDate").value;
  const ticketDeadline = document.getElementById("modalTicketDeadline").value;
  const street = document.getElementById("modalStreet").value.trim();
  const number = document.getElementById("modalNumber").value.trim();
  const neighborhood = document.getElementById("modalNeighborhood").value.trim();
  const city = document.getElementById("modalCity").value.trim();
  const state = document.getElementById("modalState").value.trim();
  const cep = document.getElementById("modalCep").value.replace(/\D/g, "").trim();
  const maxTicketsValue = document.getElementById("modalMaxTickets").value;
  const parsedMaxTickets = parseInt(maxTicketsValue, 10);
  const numericPrice = parseFloat(rawPrice);

  if (!name || !description || !eventDate || !ticketDeadline || !street || !number || !neighborhood || !city || !state || !cep) {
    alert("Erro: Todos os campos de texto e data (exceto complemento) são obrigatórios.");
    return;
  }
  if (isNaN(numericPrice) || numericPrice <= 0) {
    alert("Erro: O valor do ingresso deve ser maior que zero.");
    return;
  }
  if (isNaN(parsedMaxTickets) || parsedMaxTickets < 0) {
    alert("Erro: A quantidade máxima de ingressos é inválida. Deve ser um número maior ou igual a 0.");
    return;
  }
  if (cep.length < 8) {
    alert("Erro: CEP inválido. Deve conter 8 dígitos.");
    return;
  }

  const eventId = document.getElementById("modalEventId").value;
  const data = {
    name,
    eventDate,
    ticketDeadline,
    ticketPrice: numericPrice,
    description,
    street,
    number,
    complement: document.getElementById("modalComplement").value.trim(),
    neighborhood,
    city,
    state,
    cep,
    maxTickets: parsedMaxTickets,
    status: document.getElementById("modalStatus").value,
  };

  fetch(`/api/admin/events/${eventId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  })
    .then(async response => {
      if (response.ok) {
        await response.json();
        $("#editEventModal").modal("hide");
        location.reload();
      } else {
        const res = await response.json();
        alert("Erro: " + (res.error || "Erro ao atualizar evento."));
      }
    })
    .catch((error) => {
      console.error("Erro na requisição:", error);
      alert("Erro de rede ao tentar atualizar o evento.");
    });
}

function excluirEvento(id) {
  if (!confirm("Deseja realmente excluir este evento?")) return;
  const token = localStorage.getItem('authToken');

  if (!token) {
    alert('Sessão expirada ou inválida. Faça login novamente.');
    window.location.href = '/api/login';
    return;
  }

  fetch(`/api/admin/events/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then((response) => {
      if (response.ok) {
        location.reload();
      } else {
        alert("Erro ao excluir evento.");
      }
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro de rede.");
    });
}

function saveAddress() {
  const street = document.getElementById("addressFormStreet").value;
  const number = document.getElementById("addressFormNumber").value;
  const complement = document.getElementById("addressFormComplement").value;
  const neighborhood = document.getElementById("addressFormNeighborhood").value;
  const city = document.getElementById("addressFormCity").value;
  const state = document.getElementById("addressFormState").value;
  const cepWithMask = document.getElementById("addressFormCep").value;
  const cepClean = cepWithMask.replace(/\D/g, "");

  if (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !state.trim() || !cepClean.trim()) {
    alert("Preencha todos os campos obrigatórios do endereço, incluindo um CEP válido.");
    return;
  }

  document.getElementById("street").value = street.trim();
  document.getElementById("number").value = number.trim();
  document.getElementById("complement").value = complement.trim();
  document.getElementById("neighborhood").value = neighborhood.trim();
  document.getElementById("city").value = city.trim();
  document.getElementById("state").value = state.trim();
  document.getElementById("cep").value = cepClean.trim();

  const addressSummary = `${street.trim()}, ${number.trim()}${complement.trim() ? ' - ' + complement.trim() : ''}, ${neighborhood.trim()}, ${city.trim()} - ${state.trim()}, CEP: ${cepWithMask.trim()}`;
  document.getElementById("addressSummary").value = addressSummary;

  $('#addressModal').modal('hide');
}

function formatCEP(cep) {
  cep = cep.replace(/\D/g, "");
  cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
  return cep.substring(0, 9);
}

function formatInputAsCurrency(inputElement) {
  let value = inputElement.value;
  value = value.replace(/\D/g, '');
  if (value === '') {
    inputElement.value = '';
    return;
  }
  const numberValue = parseFloat(value) / 100;
  inputElement.value = numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function parseCurrencyValue(formattedValue) {
  if (!formattedValue || typeof formattedValue !== 'string') {    return '';
  }
  let cleaned = formattedValue.replace('R$', '').trim();
  if (cleaned === '') {
    return '';
  }
  cleaned = cleaned
    .replace(/\./g, '')
    .replace(',', '.');
  return cleaned;
}

function sanitizeNumberInput(inputElement) {
  if (inputElement) {
    inputElement.value = inputElement.value.replace(/\D/g, '');
  }
}

function preventNonNumericInput(event) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  if (allowedKeys.includes(event.key) ||
      (event.key >= '0' && event.key <= '9') ||
      (event.ctrlKey || event.metaKey)) {
    return;
  }
  event.preventDefault();
}

function validateDateTimeYear(event) {
  const input = event.target;
  let value = input.value;

  if (!value) {
    return;
  }

  const parts = value.split('T');
  let datePart = parts[0];
  const timePart = parts.length > 1 ? 'T' + parts[1] : '';

  const dateComponents = datePart.split('-');
  let yearStr = dateComponents[0];

  if (yearStr && yearStr.length > 4) {
    if (/^\d+$/.test(yearStr)) {
      yearStr = yearStr.substring(0, 4);

      let newDatePart = yearStr;
      if (dateComponents.length > 1 && dateComponents[1] !== undefined) {
        newDatePart += '-' + dateComponents[1];
      }
      if (dateComponents.length > 2 && dateComponents[2] !== undefined) {
        newDatePart += '-' + dateComponents[2];
      }
      input.value = newDatePart + timePart;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const autoDismissAlerts = document.querySelectorAll('.alert-dismissible.fade.show');

  autoDismissAlerts.forEach(function (alert) {
    setTimeout(function () {
      const closeButton = alert.querySelector('.close');
      if (closeButton) {
        closeButton.click();
      } else {
        alert.style.transition = 'opacity 1s ease';
        alert.style.opacity = '0';
        setTimeout(() => {
          alert.remove();
        }, 1000);
      }
    }, 2000);
  });

  const cepInputAddressModal = document.getElementById('addressFormCep');
  if (cepInputAddressModal) {
    cepInputAddressModal.addEventListener('input', function (e) {
      e.target.value = formatCEP(e.target.value);
    });
  }

  const cepInputEditModal = document.getElementById('modalCep');
  if (cepInputEditModal) {
    cepInputEditModal.addEventListener('input', function (e) {
      e.target.value = formatCEP(e.target.value);
    });
  }

  const ticketPriceInput = document.getElementById('ticketPrice');
  if (ticketPriceInput) {
    ticketPriceInput.addEventListener('input', function (e) {
      formatInputAsCurrency(e.target);
    });
  }

  const modalTicketPriceInput = document.getElementById('modalTicketPrice');
  if (modalTicketPriceInput) {
    modalTicketPriceInput.addEventListener('input', function (e) {
      formatInputAsCurrency(e.target);
    });
  }

  const modalNumberInput = document.getElementById('modalNumber');
  if (modalNumberInput) {
    modalNumberInput.addEventListener('keydown', preventNonNumericInput);
    modalNumberInput.addEventListener('input', function (e) {
      sanitizeNumberInput(e.target);
    });
  }

  const addressFormNumberInput = document.getElementById('addressFormNumber');
  if (addressFormNumberInput) {
    addressFormNumberInput.addEventListener('keydown', preventNonNumericInput);
    addressFormNumberInput.addEventListener('input', function (e) {
      sanitizeNumberInput(e.target);
    });
  }

  const dateTimeInputs = [
    document.getElementById('eventDate'),
    document.getElementById('ticketDeadline'),
    document.getElementById('modalEventDate'),
    document.getElementById('modalTicketDeadline')
  ];

  dateTimeInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', validateDateTimeYear);
    }
  });

  $('#addressModal').on('hidden.bs.modal', function () {
    const triggerElement = document.getElementById('addressSummary');
    if (triggerElement) {
      triggerElement.focus();
    }
  });
});
