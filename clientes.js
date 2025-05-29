let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

function exibirClientes(listaClientes = clientes) {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  listaClientes.forEach((cliente, index) => {
    const clienteDiv = document.createElement("div");
    clienteDiv.classList.add("cliente");

    const header = document.createElement("button");
    header.classList.add("cliente-header");
    header.textContent = cliente.nome;

    const detalhes = document.createElement("div");
    detalhes.classList.add("cliente-detalhes");
    detalhes.style.display = "none";

    header.addEventListener("click", () => {
      detalhes.style.display = detalhes.style.display === "block" ? "none" : "block";
    });

    detalhes.innerHTML = `
      <p><strong>CPF:</strong> ${cliente.cpf}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Endereço:</strong> ${cliente.endereco}</p>

      <div class="adicionar-servico">
        <h3>Adicionar Serviço</h3>
        <form onsubmit="adicionarServico(event, ${index})">
          <input type="text" name="nome" placeholder="Nome do serviço" required />
          <input type="date" name="data" required />
          <input type="number" name="valor" placeholder="Valor (R$)" required />
          <button type="submit">Adicionar</button>
        </form>
      </div>
      <div id="tabela-servicos-${index}">
        ${gerarTabelaServicos(cliente.servicos || [], index)}
      </div>

      <div class="cliente-botoes">
        <button class="editar" onclick="editarCliente(${index})">Editar</button>
        <button class="excluir" onclick="excluirCliente(${index})">Excluir</button>
      </div>
    `;

    clienteDiv.appendChild(header);
    clienteDiv.appendChild(detalhes);
    lista.appendChild(clienteDiv);
  });
}

function gerarTabelaServicos(servicos, clienteIndex) {
  if (!servicos || servicos.length === 0) {
    return "<p style='margin-top: 10px;'>Nenhum serviço cadastrado.</p>";
  }

  const linhas = servicos.map((servico, servicoIndex) => `
    <tr>
      <td>${servico.nome}</td>
      <td>${servico.data}</td>
      <td>R$ ${parseFloat(servico.valor).toFixed(2)}</td>
      <td><button class="remover-servico" onclick="removerServico(${clienteIndex}, ${servicoIndex})">Remover</button></td>
    </tr>
  `).join("");

  return `
    <table class="tabela-servicos">
      <thead>
        <tr><th>Serviço</th><th>Data</th><th>Valor</th><th>Ações</th></tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function adicionarServico(event, index) {
  event.preventDefault();
  const form = event.target;
  const { nome, data, valor } = form;

  const novoServico = {
    nome: nome.value,
    data: data.value,
    valor: valor.value
  };

  if (!clientes[index].servicos) {
    clientes[index].servicos = [];
  }

  clientes[index].servicos.push(novoServico);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  exibirClientes();
}

function removerServico(clienteIndex, servicoIndex) {
  clientes[clienteIndex].servicos.splice(servicoIndex, 1);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  exibirClientes();
}

function abrirModal() {
  document.getElementById("modalCliente").style.display = "block";
}

function fecharModal() {
  document.getElementById("modalCliente").style.display = "none";
  document.getElementById("formCadastroCliente").reset();
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
}

function cadastrarCliente(event) {
  event.preventDefault();

  const novoCliente = {
    nome: document.getElementById("nomeCliente").value,
    cpf: document.getElementById("cpfCliente").value,
    email: document.getElementById("emailCliente").value,
    telefone: document.getElementById("telefoneCliente").value,
    endereco: document.getElementById("enderecoCliente").value,
    servicos: []
  };

  clientes.push(novoCliente);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  fecharModal();
  exibirClientes();
}

function editarCliente(index) {
  const cliente = clientes[index];

  document.getElementById("nomeCliente").value = cliente.nome;
  document.getElementById("cpfCliente").value = cliente.cpf;
  document.getElementById("emailCliente").value = cliente.email;
  document.getElementById("telefoneCliente").value = cliente.telefone;
  document.getElementById("enderecoCliente").value = cliente.endereco;

  abrirModal();

  const form = document.getElementById("formCadastroCliente");
  form.onsubmit = function (event) {
    event.preventDefault();

    cliente.nome = document.getElementById("nomeCliente").value;
    cliente.cpf = document.getElementById("cpfCliente").value;
    cliente.email = document.getElementById("emailCliente").value;
    cliente.telefone = document.getElementById("telefoneCliente").value;
    cliente.endereco = document.getElementById("enderecoCliente").value;

    clientes[index] = cliente;
    localStorage.setItem("clientes", JSON.stringify(clientes));
    fecharModal();
    exibirClientes();
  };
}

function excluirCliente(index) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    clientes.splice(index, 1);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    exibirClientes();
  }
}

function filtrarClientes() {
  const termo = document.querySelector(".pesquisa").value.toLowerCase();
  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(termo));
  exibirClientes(clientesFiltrados);
}

window.onload = () => {
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
  exibirClientes();
};
