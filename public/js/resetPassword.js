document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRecuperarSenha');
  const popup = document.getElementById('popupReset');
  const passwordInput = document.getElementById('password');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');
  const tokenInput = document.getElementById('token');
  const criteriaContainer = document.getElementById('passwordCriteriaContainer');
  const confirmCriteriaContainer = document.getElementById('confirmPasswordCriteriaContainer');
  const lengthCrit = document.getElementById('lengthCrit');
  const upperCrit = document.getElementById('upperCrit');
  const lowerCrit = document.getElementById('lowerCrit');
  const numberCrit = document.getElementById('numberCrit');
  const specialCrit = document.getElementById('specialCrit');
  const matchCrit = document.getElementById('matchCrit');

  const params = new URLSearchParams(window.location.search);
  tokenInput.value = params.get('token');

  function updateCriterionStatus(element, isValid) {
    if (isValid) {
      element.classList.remove('invalid');
      element.classList.add('valid');
    } else {
      element.classList.remove('valid');
      element.classList.add('invalid');
    }
  }

  function checkPasswordCriteria() {
    const value = passwordInput.value;
    updateCriterionStatus(lengthCrit, value.length >= 8);
    updateCriterionStatus(upperCrit, /[A-Z]/.test(value));
    updateCriterionStatus(lowerCrit, /[a-z]/.test(value));
    updateCriterionStatus(numberCrit, /\d/.test(value));
    updateCriterionStatus(specialCrit, /[^A-Za-z0-9]/.test(value));
    checkConfirmPasswordCriteria();
  }

  function checkConfirmPasswordCriteria() {
    const passwordValue = passwordInput.value;
    const confirmValue = confirmarSenhaInput.value;
    if (confirmValue === "") {
      matchCrit.classList.remove('valid', 'invalid');
    } else {
      updateCriterionStatus(matchCrit, passwordValue === confirmValue);
    }
  }

  passwordInput.addEventListener('focus', () => {
    criteriaContainer.style.display = 'block';
  });
  passwordInput.addEventListener('input', checkPasswordCriteria);
  passwordInput.addEventListener('blur', () => {
    if (passwordInput.value === "") {
      criteriaContainer.style.display = 'none';
    }
  });

  confirmarSenhaInput.addEventListener('focus', () => {
    confirmCriteriaContainer.style.display = 'block';
  });
  confirmarSenhaInput.addEventListener('input', checkConfirmPasswordCriteria);
  confirmarSenhaInput.addEventListener('blur', () => {
    if (confirmarSenhaInput.value === "") {
      confirmCriteriaContainer.style.display = 'none';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const senha = passwordInput.value;
    const confirmar = confirmarSenhaInput.value;
    const token = tokenInput.value;

    // Validação frontend (igual ao cadastro)
    if (
      senha.length < 8 ||
      !/[A-Z]/.test(senha) ||
      !/[a-z]/.test(senha) ||
      !/\d/.test(senha) ||
      !/[^A-Za-z0-9]/.test(senha)
    ) {
      popup.textContent = "A senha não atende aos critérios de segurança.";
      popup.classList.remove("success");
      popup.style.display = "block";
      setTimeout(() => { popup.style.display = "none"; }, 4000);
      return;
    }
    if (senha !== confirmar) {
      popup.textContent = "As senhas não coincidem!";
      popup.classList.remove("success");
      popup.style.display = "block";
      setTimeout(() => { popup.style.display = "none"; }, 4000);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: senha, token })
      });

      const data = await response.json();

      if (response.ok) {
        popup.textContent = data.message || "Senha redefinida com sucesso!";
        popup.classList.add("success");
      } else {
        popup.textContent = data.error || "Erro ao redefinir senha.";
        popup.classList.remove("success");
      }
      popup.style.display = "block";
      setTimeout(() => { popup.style.display = "none"; }, 4000);

      // Opcional: redirecionar para login após sucesso
      if (response.ok) {
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
      }

    } catch (err) {
      popup.textContent = "Erro inesperado ao redefinir senha.";
      popup.classList.remove("success");
      popup.style.display = "block";
      setTimeout(() => { popup.style.display = "none"; }, 4000);
    }
  });
});
