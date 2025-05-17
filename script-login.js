window.onload = function () {
    const email = document.getElementById('email');
    const senha = document.getElementById('senha');
    const remember = document.getElementById('remember');
    const loginBtn = document.getElementById('loginBtn');

    if (localStorage.getItem('email')) {
        email.value = localStorage.getItem('email');
        senha.value = localStorage.getItem('senha');
        remember.checked = true;
    }

    loginBtn.addEventListener('click', function () {
        if (remember.checked) {
            localStorage.setItem('email', email.value);
            localStorage.setItem('senha', senha.value);
        } else {
            localStorage.removeItem('email');
            localStorage.removeItem('senha');
        }

        window.location.href = "homepage.html";
    });
};
