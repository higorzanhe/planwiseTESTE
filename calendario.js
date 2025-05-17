document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      },
      buttonText: {
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia'
      },
      locale: 'pt-br',
      height: 600
    });
    calendar.render();
  
    
    function carregarServicos() {
      const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
      const selectDescricao = document.getElementById('descricao');
  
      
      selectDescricao.innerHTML = '<option value="">Selecione um serviço</option>';
  
      
      servicos.forEach((servico) => {
        const option = document.createElement('option');
        option.value = servico.nome;
        option.textContent = servico.nome;
        selectDescricao.appendChild(option);
      });
    }
  
    carregarServicos();
  
    
    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
      e.preventDefault();
  
      const nome = document.getElementById('nome').value;
      const data = document.getElementById('data').value;
      const hora = document.getElementById('hora').value;
      const descricao = document.getElementById('descricao').value;
  
      const evento = {
        title: `${nome} - ${descricao}`,
        start: `${data}T${hora}`
      };
  
      calendar.addEvent(evento);
  
      document.getElementById('mensagemSucesso').classList.remove('d-none');
      this.reset();
  
      setTimeout(() => {
        document.getElementById('mensagemSucesso').classList.add('d-none');
      }, 3000);
    });
  });