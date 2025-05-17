
function validarFormulario(nomeId, quantidadeId, precoId, custoId, tipoId) {
    const nome = document.getElementById(nomeId).value.trim();
    const quantidade = document.getElementById(quantidadeId).value.trim();
    const preco = document.getElementById(precoId).value.trim();
    const custo = document.getElementById(custoId).value.trim();
    const tipo = document.getElementById(tipoId).value.trim();

    if (!nome || !quantidade || !preco || !custo || !tipo) {
        alert("Por favor, preencha todos os campos.");
        return false;
    }
    return true;
}

function cadastrarProduto(nome, quantidade, preco, custo, tipo) {
    const novoProduto = { nome, quantidade, preco, custo, tipo };

    if (typeof Storage !== "undefined") {
        if (localStorage.getItem("produtos") === null) {
            localStorage.setItem("produtos", JSON.stringify([]));
        }
        const produtos = JSON.parse(localStorage.getItem("produtos"));
        produtos.push(novoProduto);
        localStorage.setItem("produtos", JSON.stringify(produtos));
    } else {
        alert("Seu navegador não suporta armazenamento local.");
        return;
    }

    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("custo").value = "";
    document.getElementById("tipo").value = "";

    alert("O produto foi cadastrado com sucesso!");

    exibirProdutos();
}

function exibirProdutos() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const tabela = document.getElementById("produtos-lista");

    tabela.innerHTML = "";

    if (produtos.length === 0) {
        const linhaVazia = document.createElement("tr");
        linhaVazia.innerHTML = `
            <td colspan="6" style="text-align: center;">Nenhum produto cadastrado.</td>
        `;
        tabela.appendChild(linhaVazia);
        return;
    }

    produtos.forEach((produto) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
            <td>R$ ${parseFloat(produto.custo).toFixed(2)}</td>
            <td>${produto.tipo}</td>
            <td>
                <button onclick="editarProduto('${produto.nome}')">Editar</button>
                <button onclick="excluirProduto('${produto.nome}')">Excluir</button>
            </td>
        `;
        tabela.appendChild(linha);
    });
}

function editarProduto(nome) {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const produto = produtos.find((p) => p.nome === nome);

    if (produto) {
        document.getElementById("nome").value = produto.nome;
        document.getElementById("quantidade").value = produto.quantidade;
        document.getElementById("preco").value = produto.preco;
        document.getElementById("custo").value = produto.custo;
        document.getElementById("tipo").value = produto.tipo;

        excluirProduto(nome);
    }
}

function excluirProduto(nome) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    produtos = produtos.filter((produto) => produto.nome !== nome);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    exibirProdutos();
}

document.addEventListener("DOMContentLoaded", exibirProdutos);