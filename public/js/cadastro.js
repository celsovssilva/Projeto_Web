document.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.getElementById('formCadastro');
  const nameInput = document.getElementById('name');
  const sobrenomeInput = document.getElementById('sobrenome');
  const cpfInput = document.getElementById('cpf');
  const emailInput = document.getElementById('email');
  const telefoneInput = document.getElementById('telefone');
  const passwordInput = document.getElementById('password');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');
  const step1ErrorDiv = document.getElementById('step1Error');
  const step2ErrorDiv = document.getElementById('step2Error');
  const step4ErrorDiv = document.getElementById('step4Error');
  const lengthCrit = document.getElementById('lengthCrit');
  const upperCrit = document.getElementById('upperCrit');
  const lowerCrit = document.getElementById('lowerCrit');
  const numberCrit = document.getElementById('numberCrit');
  const specialCrit = document.getElementById('specialCrit');
  const matchCrit = document.getElementById('matchCrit');
  const passwordCriteriaContainer = document.getElementById('passwordCriteriaContainer');
  const confirmPasswordCriteriaContainer = document.getElementById('confirmPasswordCriteriaContainer');

  const toastNotification = document.getElementById('toastNotification');
  const toastMessageEl = document.getElementById('toastMessage');

  let passwordFocusedOnce = false;
  let confirmPasswordFocusedOnce = false;


  function displayStepError(errorDiv, message) {
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
  }

  function clearStepError(errorDiv) {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  let toastTimeout;

  function showToastNotification(message, type = 'error') {
    if (toastMessageEl && toastNotification) {
      toastMessageEl.textContent = message;
      toastNotification.className = 'toast-notification';
      toastNotification.classList.add('show');
      if (type === 'success') {
        toastNotification.classList.add('success');
      }
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        if (toastNotification) {
          toastNotification.classList.remove('show');
        }
      }, 5000);
    }
  }

  function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.substring(0, 11);

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  }

  cpfInput.addEventListener('input', function (e) {
    e.target.value = formatCPF(e.target.value);
  });

  function formatTelefone(inputValue) {
    const digits = inputValue.replace(/\D/g, '').substring(0, 11);

    if (digits.length === 0) {
        return '';
    }
    if (digits.length <= 2) {
      return `(${digits}`;
    }
    let formatted = `(${digits.substring(0, 2)}) `;
    const numberPart = digits.substring(2);

    if (numberPart.length === 0 && digits.length === 2) {
        return formatted.trim();
    }

    if (numberPart.length > 4 && numberPart.length === 9) {
      formatted += `${numberPart.substring(0, 5)}-${numberPart.substring(5)}`;
    } else if (numberPart.length > 4 && numberPart.length === 8) {
      formatted += `${numberPart.substring(0, 4)}-${numberPart.substring(4)}`;
    } else {
      formatted += numberPart;
    }
    return formatted;
  }

  telefoneInput.addEventListener('input', function (e) {
    e.target.value = formatTelefone(e.target.value);
  });
  function allowOnlyLetters(event) {
    event.target.value = event.target.value.replace(/[^a-zA-ZÀ-ú\s]/g, '');
  }

  nameInput.addEventListener('input', allowOnlyLetters);
  sobrenomeInput.addEventListener('input', allowOnlyLetters);



  function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum;
    let remainder;

    sum = 0;
    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  function validateStep2() {
    clearStepError(step2ErrorDiv);

    if (!emailInput.value.trim()) {
      displayStepError(step2ErrorDiv, "O campo <strong>E-mail</strong> é obrigatório.");
      emailInput.focus();
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      displayStepError(step2ErrorDiv, "Formato de <strong>E-mail</strong> inválido.");
      emailInput.focus();
      return false;
    }
    const telefoneValueRaw = telefoneInput.value.trim();
    if (!telefoneValueRaw) {
      displayStepError(step2ErrorDiv, "O campo <strong>Telefone</strong> é obrigatório.");
      telefoneInput.focus();
      return false;
    }
    const telefoneValueNumbers = telefoneValueRaw.replace(/\D/g, '');
    if (telefoneValueNumbers.length < 10 || telefoneValueNumbers.length > 11) {
      displayStepError(step2ErrorDiv, "<strong>Telefone</strong> inválido.");
      telefoneInput.focus();
      return false;
    }

    return true;
  }

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
    if (!passwordFocusedOnce) return;
    const value = passwordInput.value;
    updateCriterionStatus(lengthCrit, value.length >= 8);
    updateCriterionStatus(upperCrit, /[A-Z]/.test(value));
    updateCriterionStatus(lowerCrit, /[a-z]/.test(value));
    updateCriterionStatus(numberCrit, /\d/.test(value));
    updateCriterionStatus(specialCrit, /[^A-Za-z0-9]/.test(value));

    if (confirmPasswordFocusedOnce && confirmarSenhaInput.value) {
      checkConfirmPasswordCriteria();
    }
  }

  function checkConfirmPasswordCriteria() {
    if (!confirmPasswordFocusedOnce) return;
    const passwordValue = passwordInput.value;
    const confirmValue = confirmarSenhaInput.value;
    if (confirmValue === "") {
        matchCrit.classList.remove('valid', 'invalid');
    } else {
        updateCriterionStatus(matchCrit, passwordValue === confirmValue);
    }
  }
  passwordInput.addEventListener('focus', () => {
    if (!passwordFocusedOnce) {
      passwordFocusedOnce = true;
      checkPasswordCriteria();
    }
    if (passwordCriteriaContainer) {
      passwordCriteriaContainer.style.display = 'block';
    }
  });

  passwordInput.addEventListener('input', checkPasswordCriteria);

  confirmarSenhaInput.addEventListener('focus', () => {
    if (!confirmPasswordFocusedOnce) {
      confirmPasswordFocusedOnce = true;
      checkConfirmPasswordCriteria();
    }
    if (confirmPasswordCriteriaContainer) {
      confirmPasswordCriteriaContainer.style.display = 'block';
    }
  });

  confirmarSenhaInput.addEventListener('input', checkConfirmPasswordCriteria);

  passwordInput.addEventListener('blur', () => {
    if (passwordFocusedOnce && passwordInput.value === "" && passwordCriteriaContainer) {
      passwordCriteriaContainer.style.display = 'none';
    }
  });
  confirmarSenhaInput.addEventListener('blur', () => {
    if (confirmPasswordFocusedOnce && confirmarSenhaInput.value === "" && confirmPasswordCriteriaContainer) {
      confirmPasswordCriteriaContainer.style.display = 'none';
    }
  });

  function validateStep4() {
    clearStepError(step4ErrorDiv);

    const passwordValue = passwordInput.value;
    const confirmarSenhaValue = confirmarSenhaInput.value;

    if (!passwordValue) {
      displayStepError(step4ErrorDiv, "O campo <strong>Senha</strong> é obrigatório.");
      passwordInput.focus();
      return false;
    }
    if (!confirmarSenhaValue) {
      displayStepError(step4ErrorDiv, "O campo <strong>Confirmar Senha</strong> é obrigatório.");
      confirmarSenhaInput.focus();
      return false;
    }
    if (passwordValue !== confirmarSenhaValue) {
      displayStepError(step4ErrorDiv, "As senhas não coincidem.");
      confirmarSenhaInput.focus();
      return false;
    }

    let isValid = true;
    let errorMessage = "A senha não atende aos seguintes critérios:<br>";

    if (passwordValue.length < 8) {
        errorMessage += "- Mínimo 8 caracteres.<br>";
        isValid = false;
    }
    if (!/[A-Z]/.test(passwordValue)) {
        errorMessage += "- Pelo menos uma letra maiúscula.<br>";
        isValid = false;
    }
    if (!/[a-z]/.test(passwordValue)) {
        errorMessage += "- Pelo menos uma letra minúscula.<br>";
        isValid = false;
    }
    if (!/\d/.test(passwordValue)) {
        errorMessage += "- Pelo menos um número.<br>";
        isValid = false;
    }
    if (!/[^A-Za-z0-9]/.test(passwordValue)) {
        errorMessage += "- Pelo menos um caractere especial.<br>";
        isValid = false;
    }

    if (!isValid) {
        displayStepError(step4ErrorDiv, errorMessage);
        passwordInput.focus();
        return false;
    }

    return true;
  }
  function validateStep1() {
    clearStepError(step1ErrorDiv);

    if (!nameInput.value.trim()) {
      displayStepError(step1ErrorDiv, "O campo <strong>Nome</strong> é obrigatório.");
      nameInput.focus();
      return false;
    }
    if (!sobrenomeInput.value.trim()) {
      displayStepError(step1ErrorDiv, "O campo <strong>Sobrenome</strong> é obrigatório.");
      sobrenomeInput.focus();
      return false;
    }

    const cpfValueRaw = cpfInput.value.trim();
    if (!cpfValueRaw) {
      displayStepError(step1ErrorDiv, "O campo <strong>CPF</strong> é obrigatório.");
      cpfInput.focus();
      return false;
    }
    const cpfValueNumbers = cpfValueRaw.replace(/\D/g, '');
    if (cpfValueNumbers.length !== 11 || !isValidCPF(cpfValueNumbers)) {
      displayStepError(step1ErrorDiv, "<strong>CPF</strong> inválido.");
      cpfInput.focus();
      return false;
    }
    return true;
  }

  formCadastro.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep1() || !validateStep2() || !validateStep4()) {
      return;
    }

    const formData = new FormData(this);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    if (data.cpf) {
      data.cpf = data.cpf.replace(/\D/g, '');
    }
    if (data.telefone) {
      data.telefone = data.telefone.replace(/\D/g, '');
    }
    try {
      const response = await fetch(this.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMessage = result.error || "Erro ao realizar o cadastro. Verifique os dados.";
        showToastNotification(errorMessage, 'error');
      } else {
        showToastNotification("Cadastro realizado com sucesso! Redirecionando...", 'success');
        setTimeout(() => { window.location.href = "/api/login"; }, 2000);
      }
    } catch (error) {
      showToastNotification("Erro na conexão com o servidor. Tente novamente.", 'error');
      console.error("Erro ao enviar formulário:", error);
    }
  });

  window.nextStep = function(step) {
    clearStepError(step1ErrorDiv);
    clearStepError(step2ErrorDiv);
    clearStepError(step4ErrorDiv);

    if (step === 2) {
      if (!validateStep1()) {
        return;
      }
    } else if (step === 3) {
      if (!validateStep2()) {
        return;
      }
    }

    document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
    document.getElementById('step' + step).style.display = 'block';
  };

  window.prevStep = function(step) {
    clearStepError(step1ErrorDiv);
    clearStepError(step2ErrorDiv);
    clearStepError(step4ErrorDiv);
    document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
    document.getElementById('step' + step).style.display = 'block';
  };
});