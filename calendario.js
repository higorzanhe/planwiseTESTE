document.addEventListener('DOMContentLoaded', function () {
    // Preencher o select de serviços
    const selectServico = document.getElementById('descricao');
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
    servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.nome;
        option.textContent = servico.nome;
        selectServico.appendChild(option);
    });

    // Calendário e formulário
    const calendarEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        events: [],
        eventClick: function(info) {
            expandirDia(info.event.startStr.split('T')[0]);
        },
        dateClick: function(info) {
            const eventosDoDia = calendar.getEvents().filter(ev =>
                ev.startStr.split('T')[0] === info.dateStr
            );
            if (eventosDoDia.length > 0) {
                expandirDia(info.dateStr);
            }
        }
    });

    // Carregar eventos salvos
    const eventosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    eventosSalvos.forEach(evento => calendar.addEvent(evento));
    calendar.render();

    // Função para expandir o dia do calendário com overlay acessível e botões de ação
    function expandirDia(dateStr) {
        document.querySelectorAll('.fc-dia-overlay').forEach(el => el.remove());

        const eventosDoDia = calendar.getEvents().filter(ev =>
            ev.startStr.split('T')[0] === dateStr
        );

        let overlay = document.createElement('div');
        overlay.className = 'fc-dia-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <div class="fc-dia-overlay-content" tabindex="0">
                <button class="fc-dia-fechar" aria-label="Fechar janela">&times;</button>
                <h3 id="agenda-dia-titulo">Agendamentos do dia ${dateStr.split('-').reverse().join('/')}</h3>
                <ul>
                    ${
                        eventosDoDia.length > 0
                        ? eventosDoDia.map((ev, idx) => {
                            const hora = ev.allDay ? '<span class="badge bg-info text-dark">Dia todo</span>' :
                                `<span class="badge bg-primary">${ev.startStr.split('T')[1]?.slice(0,5) || ''}</span>`;
                            return `<li class="mb-2" data-event-id="${ev.id}">
                                ${hora} ${ev.title}
                                <button class="btn btn-sm btn-warning btn-alterar ms-2" data-idx="${idx}">Alterar</button>
                                <button class="btn btn-sm btn-danger btn-excluir ms-1" data-idx="${idx}">Excluir</button>
                            </li>`;
                        }).join('')
                        : '<li>Nenhum agendamento neste dia.</li>'
                    }
                </ul>
            </div>
        `;
        document.body.appendChild(overlay);

        // Foco e fechar overlay
        const overlayContent = overlay.querySelector('.fc-dia-overlay-content');
        overlayContent.focus();
        overlay.querySelector('.fc-dia-fechar').onclick = () => overlay.remove();
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) overlay.remove();
        });

        // Handler de exclusão
        overlay.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const evento = eventosDoDia[idx];
                if (confirm('Deseja excluir este agendamento?')) {
                    evento.remove();
                    // Remove do localStorage
                    let eventosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
                    eventosSalvos = eventosSalvos.filter(ev =>
                        !(ev.title === evento.title && ev.start === evento.startStr && (!!ev.allDay === evento.allDay))
                    );
                    localStorage.setItem('agendamentos', JSON.stringify(eventosSalvos));
                    overlay.remove();
                    // Reabre overlay atualizado
                    expandirDia(dateStr);
                }
            };
        });

        // Handler de alteração
        overlay.querySelectorAll('.btn-alterar').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const evento = eventosDoDia[idx];
                // Preenche o formulário com os dados do evento
                document.getElementById('nome').value = evento.title.split(' - ')[0];
                document.getElementById('descricao').value = evento.title.split(' - ')[1] || '';
                document.getElementById('data').value = evento.startStr.split('T')[0];
                document.getElementById('hora').value = evento.allDay ? '' : evento.startStr.split('T')[1]?.slice(0,5);

                overlay.remove();

                // Ao submeter, remove o antigo e adiciona o novo
                const form = document.getElementById('formAgendamento');
                const submitHandler = function(e) {
                    e.preventDefault();
                    evento.remove();
                    // Remove do localStorage
                    let eventosSalvos = JSON.parse(localStorage.getItem('agendamentos')) || [];
                    eventosSalvos = eventosSalvos.filter(ev =>
                        !(ev.title === evento.title && ev.start === evento.startStr && (!!ev.allDay === evento.allDay))
                    );
                    localStorage.setItem('agendamentos', JSON.stringify(eventosSalvos));
                    // Deixa o submit normal adicionar o novo evento
                    form.removeEventListener('submit', submitHandler);
                    form.submit();
                };
                form.addEventListener('submit', submitHandler);
            };
        });
    }

    // Submissão do formulário de agendamento
    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('descricao').value;

        if (!nome || !data || !descricao) return;

        // Se hora estiver vazia, cria evento allDay
        const evento = hora
            ? {
                title: `${nome} - ${descricao}`,
                start: `${data}T${hora}`
            }
            : {
                title: `${nome} - ${descricao}`,
                start: data,
                allDay: true
            };

        calendar.addEvent(evento);

        eventosSalvos.push(evento);
        localStorage.setItem('agendamentos', JSON.stringify(eventosSalvos));

        document.getElementById('mensagemSucesso').classList.remove('d-none');
        this.reset();

        setTimeout(() => {
            document.getElementById('mensagemSucesso').classList.add('d-none');
        }, 3000);
    });
});