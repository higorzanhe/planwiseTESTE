
function exibirProdutos() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const tabelaProdutos = document.getElementById("produtos-lista");
    const mensagemVazio = document.getElementById("produtos-vazio");

    tabelaProdutos.innerHTML = ""; 
    if (produtos.length === 0) {
        mensagemVazio.style.display = "table-row"; 
    }

    mensagemVazio.style.display = "none"; 

    produtos.forEach((produto) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
            <td>R$ ${parseFloat(produto.custo).toFixed(2)}</td>
            <td>${produto.tipo}</td>
        `;
        tabelaProdutos.appendChild(linha);
    });
}


function exibirServicos() {
    const servicos = JSON.parse(localStorage.getItem("servicos")) || [];
    const tabelaServicos = document.getElementById("servicos-lista");
    const mensagemVazio = document.getElementById("servicos-vazio");

    tabelaServicos.innerHTML = ""; 

    if (servicos.length === 0) {
        mensagemVazio.style.display = "table-row"; 
        return;
    }

    mensagemVazio.style.display = "none"; 

    servicos.forEach((servico) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${servico.nome}</td>
            <td>R$ ${parseFloat(servico.preco).toFixed(2)}</td>
            <td>${servico.descricao}</td>
        `;
        tabelaServicos.appendChild(linha);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    exibirProdutos();
    exibirServicos();
});