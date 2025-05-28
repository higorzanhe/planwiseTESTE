function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  function formatarValor(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  function carregarTransacoes() {
    return JSON.parse(localStorage.getItem('transacoes')) || [];
  }
  
  function salvarTransacoes(transacoes) {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
  }
  
  function atualizarInterface() {
    const transacoes = carregarTransacoes();
    const lista = document.getElementById('lista-transacoes');
    lista.innerHTML = '';
  
    let entrada = 0, saida = 0, aReceber = 0;
  
    const tipoLabel = {
      entrada: 'Entrada',
      saida: 'Saída',
      areceber: 'A Receber'
    };
  
    transacoes.forEach((t, index) => {
      const valor = parseFloat(t.valor);
      if (t.tipo === 'entrada') entrada += valor;
      else if (t.tipo === 'saida') saida += valor;
      else if (t.tipo === 'areceber') aReceber += valor;
  
      const item = document.createElement('div');
      item.classList.add('transacao');
      const classeValor = t.tipo === 'saida' ? 'negativo' : 'positivo';
  
      item.innerHTML = `
        <strong>${formatarData(t.data)}</strong>
        <p>${t.descricao}</p>
        <p>${tipoLabel[t.tipo] || t.tipo}</p>
        <p><span class="${classeValor}">${formatarValor(valor)}</span></p>
        <button class="add-button" onclick="editarTransacao(${index})">Editar</button>
      `;
  
      lista.appendChild(item);
    });
  
    document.getElementById('entrada').textContent = formatarValor(entrada);
    document.getElementById('saida').textContent = formatarValor(saida);
    document.getElementById('areceber').textContent = formatarValor(aReceber);
    document.getElementById('saldo').textContent = formatarValor(entrada - saida);
  }
  

  let indexEditando = null;
  
  // Formulário: adicionar ou editar
  document.getElementById('form-transacao').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
  
    if (!data || !descricao || !valor || !tipo) {
      alert('Preencha todos os campos!');
      return;
    }
  
    const transacoes = carregarTransacoes();
  
    if (indexEditando !== null) {
      // Editando transação existente
      transacoes[indexEditando] = { data, descricao, valor, tipo };
      indexEditando = null;
    } else {
      // Adicionando nova transação
      transacoes.push({ data, descricao, valor, tipo });
    }
  
    salvarTransacoes(transacoes);
    atualizarInterface();
  
    this.reset();
    document.getElementById('modal').style.display = 'none';
  });
  
  // Abrir modal para adicionar
  document.getElementById('abrir-modal').addEventListener('click', function () {
    indexEditando = null; // resetar modo de edição
    document.getElementById('form-transacao').reset();
    document.getElementById('modal').style.display = 'flex';
  });
  
  // Fechar modal
  document.getElementById('fechar-modal').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
    indexEditando = null;
  });
  
  // Editar transação
  function editarTransacao(index) {
    const transacoes = carregarTransacoes();
    const t = transacoes[index];
  
    document.getElementById('data').value = t.data;
    document.getElementById('descricao').value = t.descricao;
    document.getElementById('valor').value = t.valor;
    document.getElementById('tipo').value = t.tipo;
  
    indexEditando = index;
    document.getElementById('modal').style.display = 'flex';
  }
  
  // Filtro de data
  document.getElementById('filtro').addEventListener('click', () => {
    const de = new Date(document.getElementById('filtro-de').value);
    const ate = new Date(document.getElementById('filtro-ate').value);
  
    if (isNaN(de) || isNaN(ate)) {
      alert('Selecione um intervalo de datas.');
      return;
    }
  
    const transacoes = carregarTransacoes().filter(t => {
      const data = new Date(t.data);
      return data >= de && data <= ate;
    });
  
    const lista = document.getElementById('lista-transacoes');
    lista.innerHTML = '';
  
    let entrada = 0, saida = 0, aReceber = 0;
  
    const tipoLabel = {
      entrada: 'Entrada',
      saida: 'Saída',
      areceber: 'A Receber'
    };
  
    transacoes.forEach((t, index) => {
      const valor = parseFloat(t.valor);
      if (t.tipo === 'entrada') entrada += valor;
      else if (t.tipo === 'saida') saida += valor;
      else if (t.tipo === 'areceber') aReceber += valor;
  
      const dataFormatada = formatarData(t.data);
      const classeValor = t.tipo === 'saida' ? 'negativo' : 'positivo';
  
      const item = document.createElement('div');
      item.classList.add('transacao');
  
      item.innerHTML = `
        <strong>${dataFormatada}</strong>
        <p>${t.descricao}</p>
        <p>${tipoLabel[t.tipo] || t.tipo}</p>
        <p><span class="${classeValor}">${formatarValor(valor)}</span></p>
        <button class="add-button" onclick="editarTransacao(${index})">Editar</button>
      `;
  
      lista.appendChild(item);
    });
  
    document.getElementById('entrada').textContent = formatarValor(entrada);
    document.getElementById('saida').textContent = formatarValor(saida);
    document.getElementById('areceber').textContent = formatarValor(aReceber);
  });
  
