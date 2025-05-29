document.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.getElementById('formCadastro');
  const nameInput = document.getElementById('name');
  const sobrenomeInput = document.getElementById('sobrenome');
  const passwordInput = document.getElementById('password');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');

  const inputMap = {
    name: nameInput,
    sobrenome: sobrenomeInput,
    passwordLength: passwordInput,
    passwordLetter: passwordInput,
    passwordSpecial: passwordInput,
    confirmPassword: confirmarSenhaInput,
  };

  function displayErrors(errors) {
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const errorMessage = errors[key];
        const targetInput = inputMap[key];

        if (targetInput) {
          const errorSpan = document.createElement('span');
          errorSpan.classList.add('error-message');
          errorSpan.textContent = errorMessage;
          targetInput.parentNode.insertBefore(errorSpan, targetInput.nextSibling);
        } else if (key === 'general') {
          const generalErrorDiv = document.createElement('div');
          generalErrorDiv.classList.add('error-message', 'general-error');
          generalErrorDiv.textContent = errorMessage;
          formCadastro.insertBefore(generalErrorDiv, formCadastro.firstChild);
        }
      }
    }
  }

  formCadastro.addEventListener('submit', async function(e) {
    e.preventDefault();

    let errors = {};

    const passwordValue = passwordInput.value;

    if (passwordValue.length < 8) {
      errors.passwordLength = 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (!/[a-zA-Z]/.test(passwordValue)) {
      errors.passwordLetter = 'A senha deve conter pelo menos uma letra.';
    }
    if (!/[^a-zA-Z0-9\s]/.test(passwordValue)) {
      errors.passwordSpecial = 'A senha deve conter pelo menos um caractere especial.';
    }
    if (passwordValue !== confirmarSenhaInput.value) {
      errors.confirmPassword = 'As senhas não conferem.';
    }

    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(this.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) {
        displayErrors({ general: result.error || "Erro ao realizar o cadastro" });
      } else {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "/api/login";
      }
    } catch (error) {
      displayErrors({ general: "Erro na conexão com o servidor. Tente novamente." });
      console.error("Erro ao enviar formulário:", error);
    }
  });

  window.nextStep = function(step) {
    const currentStepElement = document.getElementById('step' + (step - 1));
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');

    let currentStepErrors = {};

    if (step === 2) {
      const nameValue = nameInput.value.trim();
      if (!/^[A-Za-z\s]+$/.test(nameValue)) {
        currentStepErrors.name = 'O nome não pode conter números.';
      }
      const sobrenomeValue = sobrenomeInput.value.trim();
      if (!/^[A-Za-z\s]+$/.test(sobrenomeValue)) {
        currentStepErrors.sobrenome = 'O sobrenome não pode conter números.';
      }
    }

    for (let input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return;
      }
    }

    if (Object.keys(currentStepErrors).length > 0) {
      displayErrors(currentStepErrors);
      return;
    }

    document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
    document.getElementById('step' + step).style.display = 'block';
    displayErrors({});
  };

  window.prevStep = function(step) {
    document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
    document.getElementById('step' + step).style.display = 'block';
    displayErrors({});
  };
});
