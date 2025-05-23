css  function abrirModalSenha() {
  document.getElementById('modalSenha').style.display = 'block';
}

function fecharModalSenha() {
  document.getElementById('modalSenha').style.display = 'none';
}

function redefinirSenha() {
  const email = document.getElementById('emailRedefinir').value.trim();
  const pergunta = document.getElementById('perguntaSelecionada').value;
  const resposta = document.getElementById('respostaSeguranca').value.trim().toLowerCase();
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmaSenha = document.getElementById('confirmaSenha').value;

  if (!email || !pergunta || !resposta || !novaSenha || !confirmaSenha) {
    alert('Preencha todos os campos.');
    return;
  }

  if (novaSenha !== confirmaSenha) {
    alert('As senhas não coincidem.');
    return;
  }

  const senhaForte = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
  if (!senhaForte.test(novaSenha)) {
    alert('A nova senha deve ter pelo menos 8 caracteres, incluir um número e um caractere especial.');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const index = usuarios.findIndex(user => user.email === email);

  if (index === -1) {
    alert('Usuário não encontrado.');
    return;
  }

  const usuario = usuarios[index];
  if (usuario.pergunta !== pergunta || usuario.resposta !== resposta) {
    alert('Pergunta ou resposta incorreta.');
    return;
  }

  usuarios[index].senha = novaSenha;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  alert('Senha redefinida com sucesso!');
  fecharModalSenha();
}

