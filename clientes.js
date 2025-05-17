document.querySelectorAll('.cliente-header').forEach(button => {
    button.addEventListener('click', () => {
        const detalhes = button.nextElementSibling;
        const isOpen = detalhes.style.display === 'block';
        // Fecha todos
        document.querySelectorAll('.cliente-detalhes').forEach(div => div.style.display = 'none');
        // Alterna o atual
        detalhes.style.display = isOpen ? 'none' : 'block';
    });
});