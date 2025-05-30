    function toggleAddEventFormForNew() {
      document.getElementById("eventForm").reset();
      document.getElementById("eventId").value = "";
      document.getElementById("formTitle").innerText = "Adicionar Novo Evento";
      document.getElementById("formSubmitBtn").innerText = "Salvar Evento";
      document.getElementById("eventForm").action = `/api/admin/events`;
      document.getElementById("addEventForm").style.display = "block";
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
      document.getElementById("modalEventDate").value = new Date(
        eventData.eventDate
      )
        .toISOString()
        .slice(0, 16);
      document.getElementById("modalTicketDeadline").value = new Date(
        eventData.ticketDeadline
      )
        .toISOString()
        .slice(0, 16);
      document.getElementById("modalTicketPrice").value = eventData.ticketPrice;
      document.getElementById("modalDescription").value = eventData.description;
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

  const eventId = document.getElementById("modalEventId").value;
  const data = {
    name: document.getElementById("modalName").value,
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
      const result = await response.json();
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

    document.addEventListener('DOMContentLoaded', (event) => {
      const autoDismissAlerts = document.querySelectorAll('.alert-dismissible.fade.show');

      autoDismissAlerts.forEach(function(alert) {
        setTimeout(function() {
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
    });