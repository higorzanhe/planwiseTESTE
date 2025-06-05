document.addEventListener('DOMContentLoaded', function () {
    // Get user from URL parameters
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    // Helper functions for localStorage
    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }

    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }

    function getServicos() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }

    // Initialize service selection dropdown
    function preencherServicos() {
        const servicos = getServicos();
        const select = document.getElementById('servicoCliente');
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = `${servico.nome} (${servico.duracao || 30} min)`;
            option.setAttribute('data-duracao', servico.duracao || 30);
            select.appendChild(option);
        });
    }

    // Display existing appointments (time slots only)
    function mostrarAgendamentos() {
        const agendamentos = getAgendamentos();
        const calendarioDiv = document.getElementById('calendarioCliente');
        calendarioDiv.innerHTML = '';

        if (agendamentos.length === 0) {
            calendarioDiv.innerHTML = '<p class="text-muted">Nenhum horário agendado.</p>';
            return;
        }

        // Sort appointments by date and time
        agendamentos.sort((a, b) => {
            const dateA = new Date(`${a.data}T${a.hora}`);
            const dateB = new Date(`${b.data}T${b.hora}`);
            return dateA - dateB;
        });

        const ul = document.createElement('ul');
        ul.className = 'list-group';

        agendamentos.forEach(ag => {
            const servico = getServicos().find(s => s.nome === ag.servico);
            const duracao = servico ? servico.duracao : 30;
            
            const li = document.createElement('li');
            li.className = 'list-group-item';
            const dataFormatada = ag.data.split('-').reverse().join('/');
            li.textContent = `${dataFormatada} ${ag.hora} - Horário indisponível (${duracao} min)`;
            ul.appendChild(li);
        });

        calendarioDiv.appendChild(ul);
    }

    // Form submission handler
    document.getElementById('formCliente').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nomeCliente').value.trim();
        const data = document.getElementById('dataCliente').value;
        const hora = document.getElementById('horaCliente').value;
        const servico = document.getElementById('servicoCliente').value;

        // Validation
        if (!nome || !data || !hora || !servico) {
            document.getElementById('mensagemErroCliente').textContent = 'Preencha todos os campos obrigatórios.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Check if date is not in the past
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataSelecionada = new Date(`${data}T${hora}`);
        if (dataSelecionada < hoje) {
            document.getElementById('mensagemErroCliente').textContent = 'Não é possível agendar para datas passadas.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Check for time conflicts
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

        // Save new appointment
        agendamentos.push({ 
            id: '_' + Math.random().toString(36).substr(2, 9),
            nome, 
            data, 
            hora, 
            servico 
        });
        setAgendamentos(agendamentos);

        // Show success message
        document.getElementById('mensagemSucessoCliente').classList.remove('d-none');
        document.getElementById('mensagemErroCliente').classList.add('d-none');
        this.reset();
        mostrarAgendamentos();
    });

    // Security: Block navigation to admin pages
    document.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            const link = e.target.href || (e.target.closest('a') && e.target.closest('a').href);
            if (link && (
                link.includes('gerenciamento.html') ||
                link.includes('produtoseserviços.html') ||
                link.includes('calendario.html') ||
                link.includes('admin')
            )) {
                e.preventDefault();
                alert('Acesso restrito. Você não pode acessar esta página.');
            }
        }
    });

    // Initialize page
    preencherServicos();
    mostrarAgendamentos();
});