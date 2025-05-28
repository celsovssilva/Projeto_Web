document.getElementById('formRecuperarSenha').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        if (!email) {
          alert("Por favor, informe um email válido.");
          return;
        }
        if (!role) {
          alert("Por favor, selecione um role.");
          return;
        }
        
        const data = { email, role };

        try {
          const response = await fetch(this.action, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          const result = await response.json();
          if (!response.ok) {
            alert(result.error || "Erro ao solicitar recuperação de senha.");
          } else {
            alert(result.message || "Um link para redefinir sua senha foi enviado para o seu email.");
            window.location.href = "/api/reset-password";
          }
        } catch (error) {
          console.error("Erro ao enviar formulário:", error);
          alert("Erro na conexão com o servidor. Tente novamente.");
        }
      });