document.addEventListener('DOMContentLoaded', function () {
    // Get user ID from URL
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    // Helper functions
    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }

    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }

    function getServicos() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }

    function gerarId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendarioCliente');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        businessHours: true,
        selectable: true,
        selectMirror: true,
        dateClick: function(info) {
            document.getElementById('dataCliente').value = info.dateStr;
        }
    });

    calendar.render();

    // Update calendar with existing appointments
    function atualizarCalendario() {
        calendar.removeAllEvents();
        const eventos = getAgendamentos();
        const servicos = getServicos();

        eventos.forEach(evento => {
            const servico = servicos.find(s => s.nome === evento.servico);
            const duracao = servico ? parseInt(servico.duracao) : 30;
            const start = `${evento.data}T${evento.hora}`;
            const endDate = new Date(new Date(start).getTime() + duracao * 60000);
            
            calendar.addEvent({
                title: 'Ocupado',
                start: start,
                end: endDate.toISOString(),
                color: '#dc3545',
                display: 'block'
            });
        });
    }

    // Fill services dropdown
    function preencherServicos() {
        const select = document.getElementById('servicoCliente');
        const servicos = getServicos();
        
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            select.innerHTML += `
                <option value="${servico.nome}" 
                        data-duracao="${servico.duracao || 30}"
                        data-preco="${servico.preco || 0}">
                    ${servico.nome} (${servico.duracao || 30} min)
                </option>`;
        });

        // Show price when service is selected
        select.addEventListener('change', function() {
            const option = this.options[this.selectedIndex];
            const preco = option.getAttribute('data-preco');
            const precoDisplay = document.getElementById('precoServico');
            
            if (this.value && preco) {
                precoDisplay.textContent = `Valor: R$ ${parseFloat(preco).toFixed(2)}`;
                precoDisplay.classList.remove('d-none');
            } else {
                precoDisplay.classList.add('d-none');
            }
        });
    }

    // Form submission
    document.getElementById('formCliente').addEventListener('submit', function(e) {
        e.preventDefault();

        const nome = document.getElementById('nomeCliente').value.trim();
        const data = document.getElementById('dataCliente').value;
        const hora = document.getElementById('horaCliente').value;
        const servicoSelect = document.getElementById('servicoCliente');
        const servico = servicoSelect.value;

        // Validation
        if (!nome || !data || !hora || !servico) {
            document.getElementById('mensagemErroCliente').textContent = 'Preencha todos os campos.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Check for past dates
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataSelecionada = new Date(data);
        if (dataSelecionada < hoje) {
            document.getElementById('mensagemErroCliente').textContent = 'Selecione uma data futura.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Check for conflicts
        const selectedOption = servicoSelect.options[servicoSelect.selectedIndex];
        const duracao = parseInt(selectedOption.getAttribute('data-duracao')) || 30;
        const preco = parseFloat(selectedOption.getAttribute('data-preco')) || 0;

        const inicioNovo = new Date(`${data}T${hora}`);
        const fimNovo = new Date(inicioNovo.getTime() + duracao * 60000);

        const agendamentos = getAgendamentos();
        const conflito = agendamentos.some(ev => {
            if (ev.data !== data) return false;
            const inicioEv = new Date(`${ev.data}T${ev.hora}`);
            const fimEv = new Date(inicioEv.getTime() + duracao * 60000);
            return (inicioNovo < fimEv && fimNovo > inicioEv);
        });

        if (conflito) {
            document.getElementById('mensagemErroCliente').textContent = 'Horário já ocupado.';
            document.getElementById('mensagemErroCliente').classList.remove('d-none');
            document.getElementById('mensagemSucessoCliente').classList.add('d-none');
            return;
        }

        // Save appointment
        const novoAgendamento = {
            id: gerarId(),
            nome,
            data,
            hora,
            servico,
            preco
        };

        agendamentos.push(novoAgendamento);
        setAgendamentos(agendamentos);

        // Update UI
        atualizarCalendario();
        this.reset();
        document.getElementById('precoServico').classList.add('d-none');
        document.getElementById('mensagemSucessoCliente').classList.remove('d-none');
        document.getElementById('mensagemErroCliente').classList.add('d-none');
    });

    // Initialize page
    preencherServicos();
    atualizarCalendario();
});