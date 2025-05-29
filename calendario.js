document.addEventListener('DOMContentLoaded', function () {
    // Utilitários para localStorage
    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos')) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos', JSON.stringify(arr));
    }
    function gerarId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Preencher selects de serviço (dinâmico)
    const selectServico = document.getElementById('descricao');
    const filtroServico = document.getElementById('filtroServico');
    function atualizarSelectServicos() {
        const eventos = getAgendamentos();
        const servicosUnicos = Array.from(new Set(eventos.map(ev => {
            const [_, servico] = ev.title.split(' - ');
            return (ev.servico || servico || '').trim();
        }).filter(Boolean)));
        [selectServico, filtroServico].forEach(sel => {
            if (!sel) return;
            const valorAtual = sel.value;
            sel.innerHTML = sel === filtroServico
                ? '<option value="">Todos os serviços</option>'
                : '<option value="">Selecione um serviço</option>';
            servicosUnicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico;
                option.textContent = servico;
                sel.appendChild(option);
            });
            sel.value = valorAtual;
        });
    }
    atualizarSelectServicos();

    // Variável para armazenar o ID do evento em edição
    let eventoEditandoId = null;

    // Filtros
    const filtroNome = document.getElementById('filtroNome');
    const filtroData = document.getElementById('filtroData');

    // Estado dos filtros
    let filtrosAtuais = {
        nome: '',
        servico: '',
        data: ''
    };

    // Calendário
    const calendarEl = document.getElementById('calendario');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        events: [],
        eventDidMount: function(info) {
            info.el.setAttribute('data-tooltip', info.event.title + '\n' + (info.event.extendedProps.servico || ''));
        },
        dateClick: function(info) {
            mostrarOverlayDoDia(info.dateStr);
        },
        eventClick: function(info) {
            mostrarOverlayDoDia(info.event.startStr.split('T')[0]);
        }
    });
    calendar.render();

    // Atualiza o calendário com os eventos do localStorage e filtros atuais
    function atualizarCalendario() {
        atualizarSelectServicos();
        calendar.removeAllEvents();
        filtrarAgendamentos(getAgendamentos()).forEach(evento => calendar.addEvent(evento));
    }

    // Filtro de eventos
    function filtrarAgendamentos(arr) {
        let nome = filtrosAtuais.nome.toLowerCase() || '';
        let servico = filtrosAtuais.servico || '';
        let data = filtrosAtuais.data || '';
        return arr.filter(ev => {
            let [nomeEv] = ev.title.split(' - ');
            let servicoEv = ev.servico || (ev.title.split(' - ')[1] || '');
            let dataEv = ev.start.split('T')[0];
            return (!nome || nomeEv.toLowerCase().includes(nome))
                && (!servico || servicoEv === servico)
                && (!data || dataEv === data);
        });
    }

    // Botões de filtro
    document.getElementById('btnAplicarFiltros').onclick = function() {
        filtrosAtuais.nome = filtroNome.value;
        filtrosAtuais.servico = filtroServico.value;
        filtrosAtuais.data = filtroData.value;
        atualizarCalendario();
    };
    document.getElementById('btnLimparFiltros').onclick = function() {
        filtroNome.value = '';
        filtroServico.value = '';
        filtroData.value = '';
        filtrosAtuais = { nome: '', servico: '', data: '' };
        atualizarCalendario();
    };

    // Exclui um agendamento pelo id
    function excluirAgendamento(id, dateStr) {
        let eventosSalvos = getAgendamentos();
        eventosSalvos = eventosSalvos.filter(ev => ev.id !== id);
        setAgendamentos(eventosSalvos);
        atualizarCalendario();
        mostrarOverlayDoDia(dateStr); // Reabre overlay atualizado
    }

    // Overlay do dia
    function mostrarOverlayDoDia(dateStr) {
        document.querySelectorAll('.fc-dia-overlay').forEach(el => el.remove());
        const eventosDoDia = getAgendamentos().filter(ev => {
            if (ev.allDay) return ev.start === dateStr;
            else return ev.start.startsWith(dateStr);
        });
        const overlay = document.createElement('div');
        overlay.className = 'fc-dia-overlay';
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('role', 'dialog');
        overlay.tabIndex = -1;
        overlay.style = `
            position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:9999;
            display:flex; align-items:center; justify-content:center;
        `;
        overlay.innerHTML = `
            <div class="fc-dia-overlay-content" style="background:#fff; border-radius:12px; padding:32px 24px; min-width:320px; max-width:90vw; max-height:80vh; overflow-y:auto; position:relative;" tabindex="0">
                <button class="fc-dia-fechar" aria-label="Fechar janela" style="position:absolute; top:12px; right:18px; background:none; border:none; font-size:2rem; color:#1282A2; cursor:pointer;">&times;</button>
                <h3>Agendamentos do dia ${dateStr.split('-').reverse().join('/')}</h3>
                <ul style="margin-top:18px; padding-left:0; list-style:none;">
                    ${
                        eventosDoDia.length > 0
                        ? eventosDoDia.map(ev => {
                            const hora = ev.allDay ? '<span class="badge bg-info text-dark">Dia todo</span>' :
                                `<span class="badge bg-primary">${ev.start.split('T')[1]?.slice(0,5) || ''}</span>`;
                            return `<li class="mb-2" data-event-id="${ev.id}">
                                ${hora} ${ev.title}
                                <button class="btn btn-sm btn-warning btn-alterar ms-2" data-id="${ev.id}" data-date="${dateStr}">Alterar</button>
                                <button class="btn btn-sm btn-danger btn-excluir ms-2" data-id="${ev.id}" data-date="${dateStr}">Excluir</button>
                                <button class="btn btn-sm btn-success btn-exportar ms-2" data-id="${ev.id}">Exportar</button>
                            </li>`;
                        }).join('')
                        : '<li>Nenhum agendamento neste dia.</li>'
                    }
                </ul>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.fc-dia-overlay-content').focus();

        // Fechar overlay
        overlay.querySelector('.fc-dia-fechar').onclick = () => overlay.remove();
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) overlay.remove();
        });

        // Handler de exclusão
        overlay.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const date = this.getAttribute('data-date');
                if (confirm('Deseja excluir este agendamento?')) {
                    overlay.remove();
                    excluirAgendamento(id, date);
                }
            };
        });

        // Handler de alteração
        overlay.querySelectorAll('.btn-alterar').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const evento = getAgendamentos().find(ev => ev.id === id);
                if (evento) {
                    const [nome, descricao] = evento.title.split(' - ');
                    document.getElementById('nome').value = nome || '';
                    document.getElementById('descricao').value = descricao || '';
                    document.getElementById('data').value = evento.start.split('T')[0];
                    document.getElementById('hora').value = evento.allDay ? '' : (evento.start.split('T')[1]?.slice(0,5) || '');
                    eventoEditandoId = id;
                    document.getElementById('nome').focus();
                    overlay.remove();
                }
            };
        });

        // Handler de exportação para Google Calendar
        overlay.querySelectorAll('.btn-exportar').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const ev = getAgendamentos().find(ev => ev.id === id);
                if (!ev) return;
                const [nome, servico] = ev.title.split(' - ');
                const data = ev.start.split('T')[0].replace(/-/g,'');
                const hora = ev.allDay ? '' : ev.start.split('T')[1]?.replace(':','').slice(0,4);
                let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
                url += '&text=' + encodeURIComponent(ev.title);
                url += '&dates=' + data + (hora ? 'T'+hora+'00' : '') + '/' + data + (hora ? 'T'+hora+'00' : '');
                url += '&details=' + encodeURIComponent('Agendamento via PlanWise');
                window.open(url, '_blank');
            };
        });
    }

    // Submissão do formulário de agendamento (adicionar ou alterar)
    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('descricao').value;

        // Validação: campos obrigatórios
        if (!nome || !data || !descricao) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        // Validação: data passada
        const hoje = new Date();
        const dataSelecionada = new Date(data + (hora ? 'T' + hora : 'T00:00'));
        hoje.setHours(0,0,0,0);
        if (dataSelecionada < hoje) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }
        // Validação: horário já ocupado
        let eventosSalvos = getAgendamentos();
        let conflito = eventosSalvos.some(ev =>
            ev.id !== eventoEditandoId &&
            ev.start === (hora ? `${data}T${hora}` : data)
        );
        if (conflito) {
            alert('Já existe um agendamento para este horário.');
            return;
        }

        // Se estiver editando, remove o antigo
        if (eventoEditandoId) {
            eventosSalvos = eventosSalvos.filter(ev => ev.id !== eventoEditandoId);
        }

        // Cria evento com id único (ou mantém o mesmo id se for edição)
        const evento = hora
            ? {
                id: eventoEditandoId || gerarId(),
                title: `${nome} - ${descricao}`,
                start: `${data}T${hora}`,
                servico: descricao
            }
            : {
                id: eventoEditandoId || gerarId(),
                title: `${nome} - ${descricao}`,
                start: data,
                allDay: true,
                servico: descricao
            };

        eventosSalvos.push(evento);
        setAgendamentos(eventosSalvos);

        atualizarCalendario();

        document.getElementById('mensagemSucesso').classList.remove('d-none');
        this.reset();
        eventoEditandoId = null;

        setTimeout(() => {
            document.getElementById('mensagemSucesso').classList.add('d-none');
        }, 3000);
    });

    // Botão global de exportação Google Calendar
    if (document.getElementById('btnExportarGoogle')) {
        document.getElementById('btnExportarGoogle').onclick = function() {
            const eventos = getAgendamentos();
            if (!eventos.length) return alert('Nenhum agendamento para exportar.');
            const ev = eventos[eventos.length-1];
            const [nome, servico] = ev.title.split(' - ');
            const data = ev.start.split('T')[0].replace(/-/g,'');
            const hora = ev.allDay ? '' : ev.start.split('T')[1]?.replace(':','').slice(0,4);
            let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
            url += '&text=' + encodeURIComponent(ev.title);
            url += '&dates=' + data + (hora ? 'T'+hora+'00' : '') + '/' + data + (hora ? 'T'+hora+'00' : '');
            url += '&details=' + encodeURIComponent('Agendamento via PlanWise');
            window.open(url, '_blank');
        };
    }

    // Geração de link único, complexo e fixo para o usuário interno
    if (document.getElementById('btnGerarLink')) {
        document.getElementById('btnGerarLink').addEventListener('click', function () {
            // Exemplo: identificador complexo e fixo para o usuário interno
            // Troque pelo campo real do usuário interno do seu sistema
            const usuarioInterno = "usuario@empresa.com"; // Exemplo fixo, troque pelo valor real
            const salt = "planwise2025";
            const idUnico = btoa(encodeURIComponent(usuarioInterno + ':' + salt));
            const link = `https://higorzanhe.github.io/planwiseTESTE/form-agendamento-cliente.html?usuario=${idUnico}`;
            const input = document.getElementById('linkCliente');
            input.value = link;
            input.select();
            navigator.clipboard.writeText(link);
            this.textContent = 'Link copiado!';
            setTimeout(() => { this.textContent = 'Gerar link de agendamento do cliente'; }, 2000);
        });
    }

    // Inicializa o calendário na tela
    atualizarCalendario();
});