document.addEventListener('DOMContentLoaded', function () {
    // Identificador único do usuário (do link)
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    // Carrega serviços cadastrados pelo usuário no localStorage
    function getServicosUsuario() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }

    // Preenche o select de serviços com os cadastrados pelo usuário
    const selectServico = document.getElementById('servicoCliente');
    selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
    getServicosUsuario().forEach(servico => {
        const opt = document.createElement('option');
        opt.value = servico.nome;
        opt.textContent = servico.nome + (servico.preco ? ` - R$ ${parseFloat(servico.preco).toFixed(2)}` : '');
        selectServico.appendChild(opt);
    });

    // Funções para localStorage por usuário
    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }

    // Inicializa o calendário
    const calendarEl = document.getElementById('calendarioCliente');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
        },
        events: getAgendamentos(),
        selectable: false,
        editable: false,
        height: 400
    });
    calendar.render();

    // Atualiza o calendário com os eventos do localStorage
    function atualizarCalendario() {
        calendar.removeAllEvents();
        getAgendamentos().forEach(evento => calendar.addEvent(evento));
    }

    // Submissão do formulário
    document.getElementById('formCliente').addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = document.getElementById('nomeCliente').value.trim();
        const data = document.getElementById('dataCliente').value;
        const hora = document.getElementById('horaCliente').value;
        const servico = document.getElementById('servicoCliente').value;

        if (!nome || !data || !hora || !servico) {
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemErroCliente').textContent = 'Preencha todos os campos.';
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Verifica conflito de horário
        const eventos = getAgendamentos();
        const existe = eventos.some(ev => ev.start === `${data}T${hora}`);
        if (existe) {
            document.getElementById('mensagemErroCliente').textContent = 'Já existe um agendamento para este horário.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Cria evento
        const evento = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            title: `${nome} - ${servico}`,
            start: `${data}T${hora}`,
            servico: servico
        };
        eventos.push(evento);
        setAgendamentos(eventos);

        atualizarCalendario();
        document.getElementById('mensagemErroCliente').classList.add('d-none');
        document.getElementById('mensagemSucessoCliente').classList.remove('d-none');
        this.reset();
        setTimeout(() => {
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
        }, 3000);
    });

    atualizarCalendario();
});