const transacoes = [
  { data: '2025-05-03', nome: 'Amanda', descricao: 'Cabelo | Unha', valor: 150.00, tipo: 'entrada' },
  { data: '2025-05-03', nome: 'Ana Luiza', descricao: 'Unha', valor: 50.00, tipo: 'entrada' },
  { data: '2025-05-02', nome: 'Material', descricao: 'Esmaltes | Acetona', valor: 100.00, tipo: 'saida' },
  { data: '2025-05-01', nome: 'Material', descricao: 'Algodão', valor: 30.00, tipo: 'saida' },
  { data: '2025-05-01', nome: 'Carla', descricao: 'Cabelo', valor: 200.00, tipo: 'entrada' }
];

function atualizarDashboard() {
  let entrada = 0, saida = 0, aReceber = 255;

  transacoes.forEach(transacao => {
    if (transacao.tipo === 'entrada') entrada += transacao.valor;
    if (transacao.tipo === 'saida') saida += transacao.valor;
  });

  document.getElementById('entrada').innerText = entrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('saida').innerText = saida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('a-receber').innerText = aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('saldo').innerText = (entrada + aReceber - saida).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  renderizarTransacoes();
}

function renderizarTransacoes() {
  const lista = document.getElementById('lista-transacoes');
  lista.innerHTML = '';

  const agrupadas = {};

  transacoes.forEach(t => {
    const dia = new Date(t.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' });
    if (!agrupadas[dia]) agrupadas[dia] = [];
    agrupadas[dia].push(t);
  });

  Object.keys(agrupadas).forEach(dia => {
    const grupo = document.createElement('div');
    grupo.innerHTML = `<strong>${dia.charAt(0).toUpperCase() + dia.slice(1)}</strong>`;
    
    agrupadas[dia].forEach(t => {
      const item = document.createElement('div');
      item.innerHTML = `
        ${t.nome}<br/>
        ${t.descricao}<br/>
        <span style="color: ${t.tipo === 'saida' ? 'red' : 'black'}">R$ ${t.valor.toFixed(2)}</span><br/>
      `;
      grupo.appendChild(item);
    });

    lista.appendChild(grupo);
  });
}


window.onload = () => {
  atualizarDashboard();
};
