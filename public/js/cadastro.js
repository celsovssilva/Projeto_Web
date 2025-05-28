 function nextStep(step) {
      const currentStep = document.getElementById('step' + (step - 1));
      const inputs = currentStep.querySelectorAll('input');
      for (let input of inputs) {
        if (!input.checkValidity()) {
          input.reportValidity();
          return;
        }
      }
      document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
      document.getElementById('step' + step).style.display = 'block';
    }

    function prevStep(step) {
      document.querySelectorAll('.form-step').forEach(f => f.style.display = 'none');
      document.getElementById('step' + step).style.display = 'block';
    }

    function verificarSenhas() {
      const senha = document.getElementById("password").value;
      const confirmarSenha = document.getElementById("confirmarSenha").value;
      if (senha !== confirmarSenha) {
        return "As senhas não coincidem!";
      }
      return "";
    }

    document.getElementById("formCadastro").addEventListener("submit", async function(e) {
      e.preventDefault();

      const erroSenha = verificarSenhas();
      if (erroSenha) {
        alert(erroSenha);
        return;
      }

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(this.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
          alert(result.error || "Erro ao realizar o cadastro");
        } else {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "/api/login";
        }
      } catch (error) {
        alert("Erro na conexão com o servidor. Tente novamente.");
        console.error("Erro ao enviar formulário:", error);
      }
    });