window.onload = function () {
    cargarMensajes();
    iniciarIntervalos();
    iniciarEventos();
}

function iniciarIntervalos() {
    setInterval(function () {
        cargarMensajes();
    }, 1000);
}

function iniciarEventos() {
    document.getElementById("btnEnviarMensaje").onclick = function () {
        nuevoMensaje();
        cargarMensajes();
    }
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
