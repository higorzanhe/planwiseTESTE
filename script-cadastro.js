document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
  const emailError = document.getElementById('emailError');
  const senhaError = document.getElementById('senhaError');

  emailError.textContent = '';
  senhaError.textContent = '';


  if (!email.includes('@')) {
    emailError.textContent = 'Email inválido.';
    return;
  }

  if (senha !== confirmarSenha) {
    senhaError.textContent = 'As senhas não coincidem.';
    return;
  }


  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuarioExistente = usuarios.find(user => user.email === email);

  if (usuarioExistente) {
    emailError.textContent = 'Email já cadastrado.';
    return;
  }

  
  usuarios.push({ email, senha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert('Cadastro realizado com sucesso!');
  window.location.href = 'index.html'; // Redireciona para o login
});
