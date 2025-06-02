document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRecuperarSenha');
  const popup = document.getElementById('popupErro');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();

      if (response.ok) {
        popup.textContent = data.message || "E-mail enviado com sucesso!";
        popup.classList.add("success");
      } else {
        popup.textContent = data.error || "Erro ao enviar e-mail.";
        popup.classList.remove("success");
      }
      popup.style.display = "block";
      setTimeout(() => {
        popup.style.display = "none";
      }, 4000);

    } catch (err) {
      popup.textContent = "Erro inesperado ao enviar e-mail.";
      popup.classList.remove("success");
      popup.style.display = "block";
      setTimeout(() => {
        popup.style.display = "none";
      }, 4000);
    }
  });
});