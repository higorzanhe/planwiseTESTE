document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }
    function getServicos() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }

    function preencherServicos() {
        const servicos = getServicos();
        const select = document.getElementById('servicoCliente');
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome;
            option.setAttribute('data-duracao', servico.duracao || 30);
            select.appendChild(option);
        });
    }

    // Mostra apenas horários ocupados, sem nome ou serviço
    function mostrarAgendamentos() {
        const agendamentos = getAgendamentos();
        const calendarioDiv = document.getElementById('calendarioCliente');
        calendarioDiv.innerHTML = '';
        if (agendamentos.length === 0) {
            calendarioDiv.innerHTML = '<p class="text-muted">Nenhum horário agendado.</p>';
            return;
        }
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        agendamentos.forEach(ag => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            // Apenas data e hora, sem nome ou serviço!
            li.textContent = `${ag.data} ${ag.hora} - Horário indisponível`;
            ul.appendChild(li);
        });
        calendarioDiv.appendChild(ul);
    }

    document.getElementById('formCliente').addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nomeCliente').value.trim();
        const data = document.getElementById('dataCliente').value;
        const hora = document.getElementById('horaCliente').value;
        const servico = document.getElementById('servicoCliente').value;

        if (!nome || !data || !hora || !servico) {
            document.getElementById('mensagemErroCliente').textContent = 'Preencha todos os campos obrigatórios.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        const servicos = getServicos();
        const servicoSelecionado = servicos.find(s => s.nome === servico);
        const duracao = servicoSelecionado ? parseInt(servicoSelecionado.duracao) : 30;

        const inicioNovo = new Date(`${data}T${hora}`);
        const fimNovo = new Date(inicioNovo.getTime() + duracao * 60000);

        const agendamentos = getAgendamentos();
        const existe = agendamentos.some(ev => {
            if (ev.data !== data) return false;
            const servicoEv = servicos.find(s => s.nome === ev.servico);
            const duracaoEv = servicoEv ? parseInt(servicoEv.duracao) : 30;
            const inicioEv = new Date(`${ev.data}T${ev.hora}`);
            const fimEv = new Date(inicioEv.getTime() + duracaoEv * 60000);
            return (inicioNovo < fimEv && fimNovo > inicioEv);
        });

        if (existe) {
            document.getElementById('mensagemErroCliente').textContent = 'Já existe um agendamento para este horário.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        agendamentos.push({ nome, data, hora, servico });
        setAgendamentos(agendamentos);

        document.getElementById('mensagemSucessoCliente').classList.remove('d-none');
        document.getElementById('mensagemErroCliente').classList.add('d-none');
        this.reset();
        mostrarAgendamentos();
    });

    preencherServicos();
    mostrarAgendamentos();
});

// Bloqueia tentativas de navegação para páginas administrativas
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
        const link = e.target.href || (e.target.closest('a') && e.target.closest('a').href);
        if (link && (
            link.includes('gerenciamento.html') ||
            link.includes('produtoseserviços.html') ||
            link.includes('calendario.html') ||
            link.includes('admin') // ajuste conforme suas páginas restritas
        )) {
            e.preventDefault();
            alert('Acesso restrito. Você não pode acessar esta página.');
        }
    }
});