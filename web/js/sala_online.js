window.onload = function () {
    cargarTodo();
    iniciarIntervalos();
    iniciarEventos();
}

function iniciarIntervalos() {
    setInterval(function () {
        cargarTodo();
    }, 1000);
}

function cargarTodo() {
    cargarMensajes();
    cargarUsuarios();
    cargarInvitaciones();
    cargarPartidasEnCurso();
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

    xhr.open("GET", "/nuevo_mensaje?texto=" + texto, true);
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

    xhr.open("GET", "/cargar_mensajes_sala", true);
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
                let invitar = document.createElement("span");
                usuario.classList.add("divUsuario");
                invitar.classList.add("usuariosInvitar");

                nombre.innerHTML = "<a href='usuario/partidas/" + respuesta[i].id + "'>" + respuesta[i].nombre + "</a>";
                invitar.innerHTML = "Invitar";
                invitar.addEventListener("click", function () {
                    invitarPartida(respuesta[i].id);
                });

                usuario.appendChild(nombre);
                usuario.appendChild(invitar);
                divUsuarios.appendChild(usuario);
            }
        }
    };

    xhr.open("GET", "/cargar_usuarios", true);
    xhr.send();
}

function invitarPartida(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/invitar_partida?invitado=" + id, true);
    xhr.send();
}

function cargarInvitaciones() {
    let divInvitaciones = document.getElementById("divInvitaciones");
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);

            divInvitaciones.innerHTML = "";
            for (let i = 0, finI = respuesta.length; i < finI; i++) {
                let invitacion = document.createElement("div");
                let anfitrion = document.createElement("span");
                let rechazar = document.createElement("span");
                let aceptar = document.createElement("span");
                invitacion.classList.add("divInvitacion");
                rechazar.classList.add("invitacionRechazar");
                aceptar.classList.add("invitacionAceptar");

                anfitrion.innerHTML = respuesta[i].anfitrion;

                rechazar.innerHTML = "Rechazar";
                rechazar.addEventListener("click", function () {
                    rechazarInvitacion(respuesta[i].id);
                    cargarInvitaciones();
                });

                aceptar.innerHTML = "Aceptar";
                aceptar.addEventListener("click", function () {
                    aceptarInvitacion(respuesta[i].id);
                    cargarInvitaciones();
                    cargarPartidasEnCurso();
                });

                invitacion.appendChild(anfitrion);
                invitacion.appendChild(rechazar);
                invitacion.appendChild(aceptar);
                divInvitaciones.appendChild(invitacion);
            }
        }
    };

    xhr.open("GET", "/cargar_invitaciones", true);
    xhr.send();
}

function rechazarInvitacion(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/rechazar_invitacion?partida=" + id, true);
    xhr.send();
}

function aceptarInvitacion(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/aceptar_invitacion?partida=" + id, true);
    xhr.send();
}

function cargarPartidasEnCurso() {
    let divPartidas = document.getElementById("divPartidas");
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);

            divPartidas.innerHTML = "";
            for (let i = 0, finI = respuesta.length; i < finI; i++) {
                let partida = document.createElement("div");
                let rival = document.createElement("span");
                let jugar = document.createElement("span");
                let numMov = document.createElement("span");
                partida.classList.add("divPartida");
                rival.classList.add("partidaRival");
                jugar.classList.add("partidaJugar");
                numMov.classList.add("partidaNumMov");

                rival.innerHTML = respuesta[i].rival;
                jugar.innerHTML = "<a href='partida_online/" + respuesta[i].id + "'>Jugar</a>";
                numMov.innerHTML = "Movs: " + respuesta[i].numMov;

                partida.appendChild(rival);
                partida.appendChild(jugar);
                partida.appendChild(numMov);
                divPartidas.appendChild(partida);
            }
        }
    };

    xhr.open("GET", "/cargar_partidas_en_curso", true);
    xhr.send();
}
