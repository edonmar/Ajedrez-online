window.onload = function () {
    cargarMensajes();
    cargarUsuarios();
    iniciarIntervalos();
    iniciarEventos();
}

function iniciarIntervalos() {
    setInterval(function () {
        cargarMensajes();
        cargarUsuarios();
    }, 1000);
}

function iniciarEventos() {
    let textAreaChat = document.getElementById("textAreaChat");
    textAreaChat.addEventListener("keyup", function (event) {
        // Si pulso enter
        if (event.keyCode === 13) {
            event.preventDefault();
            nuevoMensaje();
            cargarMensajes();
        }
    });

    let btnEnviarMensaje = document.getElementById("btnEnviarMensaje");
    btnEnviarMensaje.addEventListener("click", function () {
        nuevoMensaje();
        cargarMensajes();
    });
}

function nuevoMensaje() {
    let textArea = document.getElementById("textAreaChat");
    let texto = textArea.value;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "/nuevo_mensaje?texto=" + texto, true)
    xhr.send();

    textArea.value = null;
}

function cargarMensajes() {
    let divMensajes = document.getElementById("divMensajes");
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);

            divMensajes.innerHTML = "";
            for (let i = 0, finI = respuesta.length; i < finI; i++) {
                let mensaje = document.createElement("div");
                let autor = document.createElement("span");
                let texto = document.createElement("span");
                mensaje.classList.add("divMensaje");
                autor.classList.add("msgAutor");

                autor.innerHTML = respuesta[i].usuario + ": ";
                texto.innerHTML = respuesta[i].texto;

                mensaje.appendChild(autor);
                mensaje.appendChild(texto);
                divMensajes.appendChild(mensaje);
            }
            divMensajes.scrollTop = divMensajes.scrollHeight;
        }
    };

    xhr.open("GET", "/cargar_mensajes", true)
    xhr.send();
}

function cargarUsuarios() {
    let divUsuarios = document.getElementById("divUsuarios");
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);

            divUsuarios.innerHTML = "";
            for (let i = 0, finI = respuesta.length; i < finI; i++) {
                let usuario = document.createElement("div");
                let nombre = document.createElement("span");
                usuario.classList.add("divUsuario");

                nombre.innerHTML = "<a href='usuario/partidas/" + respuesta[i].id + "'>" + respuesta[i].nombre + "</a>";

                usuario.appendChild(nombre);
                divUsuarios.appendChild(usuario);
            }
            divUsuarios.scrollTop = divUsuarios.scrollHeight;
        }
    };

    xhr.open("GET", "/cargar_usuarios", true)
    xhr.send();
}
