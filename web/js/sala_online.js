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
                let color = document.createElement("span");
                let numMov = document.createElement("span");
                let miTurno = document.createElement("span");
                partida.classList.add("divPartida");
                rival.classList.add("partidaRival");
                jugar.classList.add("partidaJugar");
                color.classList.add("partidaColor");
                numMov.classList.add("partidaNumMov");
                miTurno.classList.add("partidaMiTurno");

                rival.innerHTML = respuesta[i].rival;
                jugar.innerHTML = "<a href='partida_online/" + respuesta[i].id + "'>Jugar</a>";
                numMov.innerHTML = "Movs: " + respuesta[i].numMov;
                if (respuesta[i].miTurno)
                    miTurno.innerHTML = "Mi turno";
                if (respuesta[i].miColor)
                    color.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="21" height="21" style=""><rect id="backgroundrect" width="100%" height="100%" x="0" y="0" fill="none" stroke="none" style="" class=""/>\n' +
                        '<g class="currentLayer" style=""><title>Layer 1</title><path d="M10.702129364013672,0 C8.64546012878418,0 6.979649066925049,1.2593061923980713 6.979649066925049,2.814091682434082 C6.979649066925049,3.4402270317077637 7.24953031539917,4.017116069793701 7.705532550811768,4.488475799560547 C5.890824317932129,5.276421070098877 4.653099536895752,6.74678373336792 4.653099536895752,8.44227409362793 C4.653099536895752,9.8704252243042 5.5278825759887695,11.143802642822266 6.89589262008667,11.980995178222656 C4.104033946990967,12.726728439331055 0,15.88554573059082 0,21.457447052001953 L21.40425682067871,21.457447052001953 C21.40425682067871,15.88554573059082 17.300222396850586,12.726728439331055 14.508363723754883,11.980995178222656 C15.876374244689941,11.143802642822266 16.751157760620117,9.8704252243042 16.751157760620117,8.44227409362793 C16.751157760620117,6.74678373336792 15.513433456420898,5.276421070098877 13.698723793029785,4.488475799560547 C14.154727935791016,4.017116069793701 14.424607276916504,3.4402270317077637 14.424607276916504,2.814091682434082 C14.424607276916504,1.2593061923980713 12.758797645568848,0 10.702129364013672,0 z" style="opacity:1; fill:#ffffff; fill-opacity:1; fill-rule:nonzero; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" id="svg_1" class=""/></g></svg>';
                else
                    color.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20"><rect id="backgroundrect" width="100%" height="100%" x="0" y="0" fill="none" stroke="none" style="" class=""/>\n' +
                        '<g class="currentLayer" style=""><title>Layer 1</title><path d="M9.95410442352295,0 C8.04118537902832,0 6.491806507110596,1.1620266437530518 6.491806507110596,2.596708059310913 C6.491806507110596,3.1744754314422607 6.742825031280518,3.706800699234009 7.166955471038818,4.141749382019043 C5.479085445404053,4.868827819824219 4.327871799468994,6.225607395172119 4.327871799468994,7.790124416351318 C4.327871799468994,9.107954025268555 5.1415114402771,10.282964706420898 6.413904666900635,11.055484771728516 C3.817183017730713,11.743612289428711 0,14.658416748046875 0,19.799898147583008 L19.9082088470459,19.799898147583008 C19.9082088470459,14.658416748046875 16.091028213500977,11.743612289428711 13.494302749633789,11.055484771728516 C14.76669692993164,10.282964706420898 15.580338478088379,9.107954025268555 15.580338478088379,7.790124416351318 C15.580338478088379,6.225607395172119 14.429122924804688,4.868827819824219 12.741253852844238,4.141749382019043 C13.165384292602539,3.706800699234009 13.416401863098145,3.1744754314422607 13.416401863098145,2.596708059310913 C13.416401863098145,1.1620266437530518 11.867023468017578,0 9.95410442352295,0 z" style="opacity:1; fill:#000000; fill-opacity:1; fill-rule:nonzero; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" id="svg_1" class="selected"/></g></svg>';

                partida.appendChild(rival);
                partida.appendChild(jugar);
                partida.appendChild(color);
                partida.appendChild(numMov);
                partida.appendChild(miTurno);
                divPartidas.appendChild(partida);
            }
        }
    };

    xhr.open("GET", "/cargar_partidas_en_curso", true);
    xhr.send();
}
