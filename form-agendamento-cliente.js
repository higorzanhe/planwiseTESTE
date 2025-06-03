document.addEventListener('DOMContentLoaded', function () {
    // Pega o identificador do usuário da URL
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }

    // Preencher serviços cadastrados
    function preencherServicos() {
        const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
        const select = document.getElementById('servicoCliente');
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome;
            select.appendChild(option);
        });
    }

    // Mostrar agendamentos já feitos
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
            li.textContent = `${ag.data} ${ag.hora} - ${ag.nome} (${ag.servico})`;
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
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Verifica conflito de horário
        const agendamentos = getAgendamentos();
        const existe = agendamentos.some(ev => ev.data === data && ev.hora === hora);
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