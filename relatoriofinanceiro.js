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
        <p>Método: ${t.metodo || 'Não informado'}</p>
        <p><span class="${classeValor}">${formatarValor(valor)}</span></p>
        <div class="botoes-transacao">
          <button class="add-button" onclick="editarTransacao(${index})">Editar</button>
          <button class="excluir-button" onclick="excluirTransacao(${index})">Excluir</button>
        </div>
      `;
  
      lista.appendChild(item);
    });
  
    document.getElementById('entrada').textContent = formatarValor(entrada);
    document.getElementById('saida').textContent = formatarValor(saida);
    document.getElementById('areceber').textContent = formatarValor(aReceber);
    document.getElementById('saldo').textContent = formatarValor(entrada - saida);
  }
  
  let indexEditando = null;
  
  document.getElementById('form-transacao').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
    const metodo = document.getElementById('metodoPagamento').value;
  
    if (!data || !descricao || !valor || !tipo) {
      alert('Preencha todos os campos!');
      return;
    }
  
    const transacoes = carregarTransacoes();
  
    if (indexEditando !== null) {
      transacoes[indexEditando] = { data, descricao, valor, tipo, metodo };
      indexEditando = null;
    } else {
      transacoes.push({ data, descricao, valor, tipo, metodo });
    }
  
    salvarTransacoes(transacoes);
    atualizarInterface();
  
    this.reset();
    document.getElementById('modal').style.display = 'none';
  });
  
  document.getElementById('abrir-modal').addEventListener('click', function () {
    indexEditando = null;
    document.getElementById('form-transacao').reset();
    document.getElementById('modal').style.display = 'flex';
  });
  
  document.getElementById('fechar-modal').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
    indexEditando = null;
  });
  
  function editarTransacao(index) {
    const transacoes = carregarTransacoes();
    const t = transacoes[index];
  
    document.getElementById('data').value = t.data;
    document.getElementById('descricao').value = t.descricao;
    document.getElementById('valor').value = t.valor;
    document.getElementById('tipo').value = t.tipo;
    document.getElementById('metodoPagamento').value = t.metodo || '';
  
    indexEditando = index;
    document.getElementById('modal').style.display = 'flex';
  }
  
  function excluirTransacao(index) {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      const transacoes = carregarTransacoes();
      transacoes.splice(index, 1);
      salvarTransacoes(transacoes);
      atualizarInterface();
    }
  }
  
  document.getElementById('filtro').addEventListener('click', () => {
    const inputDe = document.getElementById('filtro-de').value;
    const inputAte = document.getElementById('filtro-ate').value;
  
    const de = new Date(inputDe + 'T00:00:00');
    const ate = new Date(inputAte + 'T23:59:59');
  
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
  
      const classeValor = t.tipo === 'saida' ? 'negativo' : 'positivo';
  
      const item = document.createElement('div');
      item.classList.add('transacao');
  
      item.innerHTML = `
        <strong>${formatarData(t.data)}</strong>
        <p>${t.descricao}</p>
        <p>${tipoLabel[t.tipo] || t.tipo}</p>
        <p>Método: ${t.metodo || 'Não informado'}</p>
        <p><span class="${classeValor}">${formatarValor(valor)}</span></p>
        <div class="botoes-transacao">
          <button class="add-button" onclick="editarTransacao(${index})">Editar</button>
          <button class="excluir-button" onclick="excluirTransacao(${index})">Excluir</button>
        </div>
      `;
  
      lista.appendChild(item);
    });
  
    document.getElementById('entrada').textContent = formatarValor(entrada);
    document.getElementById('saida').textContent = formatarValor(saida);
    document.getElementById('areceber').textContent = formatarValor(aReceber);
  });
  
  atualizarInterface();
