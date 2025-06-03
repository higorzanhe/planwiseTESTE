document.addEventListener('DOMContentLoaded', function () {
    // Suporte a usuário via querystring
    const params = new URLSearchParams(window.location.search);
    const usuario = params.get('usuario') || 'default';

    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }
    function gerarId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    function getServicosCadastrados() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }

    // Preencher select de serviços
    const selectServico = document.getElementById('descricao');
    function atualizarSelectServicos() {
        const servicos = getServicosCadastrados();
        const valorAtual = selectServico.value;
        selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome + (servico.preco ? ` - R$ ${parseFloat(servico.preco).toFixed(2)}` : '');
            selectServico.appendChild(option);
        });
        selectServico.value = valorAtual;
    }
    atualizarSelectServicos();

    let eventoEditandoId = null;

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
            info.el.setAttribute('title', info.event.title);
        },
        dateClick: function(info) {
            mostrarOverlayDoDia(info.dateStr);
        },
        eventClick: function(info) {
            mostrarOverlayDoDia(info.event.startStr.split('T')[0]);
        }
    });
    calendar.render();

    function atualizarCalendario() {
        atualizarSelectServicos();
        calendar.removeAllEvents();
        getAgendamentos().forEach(evento => calendar.addEvent(evento));
    }

    function excluirAgendamento(id, dateStr) {
        let eventosSalvos = getAgendamentos();
        eventosSalvos = eventosSalvos.filter(ev => ev.id !== id);
        setAgendamentos(eventosSalvos);
        atualizarCalendario();
        mostrarOverlayDoDia(dateStr);
    }

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
                                ${hora} <strong>${ev.title.split(' - ')[0]}</strong> <span class="text-muted">${ev.servico || ''}</span>
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

        overlay.querySelector('.fc-dia-fechar').onclick = () => overlay.remove();
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) overlay.remove();
        });

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

    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('descricao').value;

        if (!nome || !data || !descricao) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        const hoje = new Date();
        const dataSelecionada = new Date(data + (hora ? 'T' + hora : 'T00:00'));
        hoje.setHours(0,0,0,0);
        if (dataSelecionada < hoje) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }
        let eventosSalvos = getAgendamentos();
        let conflito = eventosSalvos.some(ev =>
            ev.id !== eventoEditandoId &&
            ev.start === (hora ? `${data}T${hora}` : data)
        );
        if (conflito) {
            alert('Já existe um agendamento para este horário.');
            return;
        }

        if (eventoEditandoId) {
            eventosSalvos = eventosSalvos.filter(ev => ev.id !== eventoEditandoId);
        }

        // Título curto para o calendário!
        const evento = hora
            ? {
                id: eventoEditandoId || gerarId(),
                title: nome,
                start: `${data}T${hora}`,
                servico: descricao
            }
            : {
                id: eventoEditandoId || gerarId(),
                title: nome,
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

    if (document.getElementById('btnGerarLink')) {
        document.getElementById('btnGerarLink').addEventListener('click', function () {
            const usuarioInterno = "usuario@empresa.com"; // Troque pelo valor real
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

    atualizarCalendario();
});