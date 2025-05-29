let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

function exibirClientes() {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  clientes.forEach((cliente, index) => {
    const clienteDiv = document.createElement("div");
    clienteDiv.classList.add("cliente");

    const header = document.createElement("div");
    header.classList.add("cliente-header");
    header.textContent = `${cliente.nome} - ${cliente.cpf}`;
    header.onclick = () => {
      detalhes.style.display = detalhes.style.display === "block" ? "none" : "block";
    };

    const detalhes = document.createElement("div");
    detalhes.classList.add("cliente-detalhes");

    detalhes.innerHTML = `
      <p><strong>Email:</strong> ${cliente.email}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Endereço:</strong> ${cliente.endereco}</p>
      <h4>Serviços Realizados:</h4>
      <ul id="servicos-${index}">
        ${cliente.servicos?.map(s => `<li>${s.data} - ${s.descricao}</li>`).join('') || "<li>Nenhum serviço ainda.</li>"}
      </ul>
      <form onsubmit="adicionarServico(event, ${index})">
        <input type="text" name="descricao" placeholder="Descrição do serviço" required />
        <input type="date" name="data" required />
        <button type="submit">Adicionar Serviço</button>
      </form>
    `;

    clienteDiv.appendChild(header);
    clienteDiv.appendChild(detalhes);
    lista.appendChild(clienteDiv);
  });
}

function adicionarServico(e, index) {
  e.preventDefault();
  const descricao = e.target.descricao.value;
  const data = e.target.data.value;

  if (!descricao || !data) return;

  if (!clientes[index].servicos) clientes[index].servicos = [];
  clientes[index].servicos.push({ descricao, data });

  localStorage.setItem("clientes", JSON.stringify(clientes));
  exibirClientes();
}

window.onload = exibirClientes;

// Opcional: função para filtrar clientes no input de pesquisa
function filtrarClientes() {
  const filtro = document.querySelector(".pesquisa").value.toLowerCase();
  const lista = document.getElementById("listaClientes");
  lista.childNodes.forEach(div => {
    const texto = div.querySelector(".cliente-header").textContent.toLowerCase();
    div.style.display = texto.includes(filtro) ? "" : "none";
  });
}
