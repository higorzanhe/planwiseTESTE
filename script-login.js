document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();
  const lembrarMe = document.getElementById('lembrarMe').checked;

 
  if (email === '' || senha === '') {
    alert('Por favor, preencha o email e a senha.');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuario = usuarios.find(user => user.email === email && user.senha === senha);

  if (usuario) {
    if (lembrarMe) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    } else {
      sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    }

    alert('Login realizado com sucesso!');
    window.location.href = 'gerenciamento.html';
  } else {
    alert('Email ou senha incorretos.');
  }
});

document.getElementById('esqueciSenha').addEventListener('click', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    alert('Digite seu email no campo para recuperar a senha.');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuario = usuarios.find(user => user.email === email);

  if (usuario) {
    alert(`Sua senha é: ${usuario.senha}`);
  } else {
    alert('Email não encontrado.');
  }
});

