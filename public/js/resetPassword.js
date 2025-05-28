function verificarSenhas() {
  const senha = document.getElementById("password").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
  } else {
    alert("Senha redefinida com sucesso!");
  }
}