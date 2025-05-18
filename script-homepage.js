function sair() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
  }
  
  function mostrarAjuda() {
    document.getElementById("ajuda-modal").style.display = "block";
  }
  
  function fecharAjuda() {
    document.getElementById("ajuda-modal").style.display = "none";
  }
  
  window.onclick = function(event) {
    const modal = document.getElementById("ajuda-modal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  
