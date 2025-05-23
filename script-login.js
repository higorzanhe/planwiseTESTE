document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();
  const lembrarMe = document.getElementById('lembrarMe').checked;

  if (!email || !senha) {
    alert('Preencha todos os campos.');
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
  abrirModalSenha();
});

function abrirModalSenha() {
  document.getElementById('modalSenha').style.display = 'block';
}

function fecharModalSenha() {
  document.getElementById('modalSenha').style.display = 'none';
}

function redefinirSenha() {
  const email = document.getElementById('emailRedefinir').value.trim();
  const novaSenha = document.getElementById('novaSenha').value.trim();

  if (!email || !novaSenha) {
    alert('Preencha todos os campos.');
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const index = usuarios.findIndex(user => user.email === email);

  if (index !== -1) {
    usuarios[index].senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Senha redefinida com sucesso!');
    fecharModalSenha();
  } else {
    alert('Email não encontrado.');
  }
}
