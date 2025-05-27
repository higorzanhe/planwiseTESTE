document.addEventListener('DOMContentLoaded', function () {
    // Produtos
    const produtosKey = 'produtos';
    const produtosLista = document.getElementById('produtos-lista');
    let produtos = JSON.parse(localStorage.getItem(produtosKey)) || [];
    let editandoProduto = null;

    function renderProdutos() {
        produtosLista.innerHTML = '';
        if (produtos.length === 0) {
            produtosLista.innerHTML = `<tr><td colspan="6" id="produtos-vazio">Nenhum produto cadastrado.</td></tr>`;
            return;
        }
        produtos.forEach((produto, idx) => {
            produtosLista.innerHTML += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                    <td>R$ ${parseFloat(produto.custo).toFixed(2)}</td>
                    <td>${produto.tipo}</td>
                    <td>
                        <button class="btn btn-sm btn-warning btn-alterar-produto" data-idx="${idx}">Alterar</button>
                        <button class="btn btn-sm btn-danger btn-excluir-produto ms-1" data-idx="${idx}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        // Excluir produto
        produtosLista.querySelectorAll('.btn-excluir-produto').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                if (confirm('Deseja excluir este produto?')) {
                    produtos.splice(idx, 1);
                    localStorage.setItem(produtosKey, JSON.stringify(produtos));
                    renderProdutos();
                }
            };
        });

        // Alterar produto
        produtosLista.querySelectorAll('.btn-alterar-produto').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                const produto = produtos[idx];
                document.getElementById('nomeProduto').value = produto.nome;
                document.getElementById('quantidadeProduto').value = produto.quantidade;
                document.getElementById('precoProduto').value = produto.preco;
                document.getElementById('custoProduto').value = produto.custo;
                document.getElementById('tipoProduto').value = produto.tipo;
                editandoProduto = idx;
                document.getElementById('btnProduto').textContent = 'Salvar Alteração';
            };
        });
    }

    document.getElementById('formProduto').addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nomeProduto').value.trim();
        const quantidade = document.getElementById('quantidadeProduto').value;
        const preco = document.getElementById('precoProduto').value;
        const custo = document.getElementById('custoProduto').value;
        const tipo = document.getElementById('tipoProduto').value;
        if (!nome || !quantidade || !preco || !custo || !tipo) return;

        if (editandoProduto !== null) {
            produtos[editandoProduto] = { nome, quantidade, preco, custo, tipo };
            editandoProduto = null;
            document.getElementById('btnProduto').textContent = 'Cadastrar Produto';
        } else {
            produtos.push({ nome, quantidade, preco, custo, tipo });
        }
        localStorage.setItem(produtosKey, JSON.stringify(produtos));
        this.reset();
        renderProdutos();
    });

    document.getElementById('toggle-produtos').onclick = function () {
        const container = document.getElementById('produtos-container');
        container.style.display = container.style.display === 'none' ? '' : 'none';
    };

    renderProdutos();

    // Serviços
    const servicosKey = 'servicos';
    const servicosLista = document.getElementById('servicos-lista');
    let servicos = JSON.parse(localStorage.getItem(servicosKey)) || [];
    let editandoServico = null;

    function renderServicos() {
        servicosLista.innerHTML = '';
        if (servicos.length === 0) {
            servicosLista.innerHTML = `<tr><td colspan="4" id="servicos-vazio">Nenhum serviço cadastrado.</td></tr>`;
            return;
        }
        servicos.forEach((servico, idx) => {
            servicosLista.innerHTML += `
                <tr>
                    <td>${servico.nome}</td>
                    <td>R$ ${parseFloat(servico.preco).toFixed(2)}</td>
                    <td>${servico.descricao}</td>
                    <td>
                        <button class="btn btn-sm btn-warning btn-alterar-servico" data-idx="${idx}">Alterar</button>
                        <button class="btn btn-sm btn-danger btn-excluir-servico ms-1" data-idx="${idx}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        // Excluir serviço
        servicosLista.querySelectorAll('.btn-excluir-servico').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                if (confirm('Deseja excluir este serviço?')) {
                    servicos.splice(idx, 1);
                    localStorage.setItem(servicosKey, JSON.stringify(servicos));
                    renderServicos();
                }
            };
        });

        // Alterar serviço
        servicosLista.querySelectorAll('.btn-alterar-servico').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                const servico = servicos[idx];
                document.getElementById('nomeServico').value = servico.nome;
                document.getElementById('precoServico').value = servico.preco;
                document.getElementById('descricaoServico').value = servico.descricao;
                editandoServico = idx;
                document.getElementById('btnServico').textContent = 'Salvar Alteração';
            };
        });
    }

    document.getElementById('formServico').addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nomeServico').value.trim();
        const preco = document.getElementById('precoServico').value;
        const descricao = document.getElementById('descricaoServico').value.trim();
        if (!nome || !preco || !descricao) return;

        if (editandoServico !== null) {
            servicos[editandoServico] = { nome, preco, descricao };
            editandoServico = null;
            document.getElementById('btnServico').textContent = 'Cadastrar Serviço';
        } else {
            servicos.push({ nome, preco, descricao });
        }
        localStorage.setItem(servicosKey, JSON.stringify(servicos));
        this.reset();
        renderServicos();
    });

    document.getElementById('toggle-servicos').onclick = function () {
        const container = document.getElementById('servicos-container');
        container.style.display = container.style.display === 'none' ? '' : 'none';
    };

    renderServicos();
});