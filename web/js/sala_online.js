window.onload = function() {
    iniciarEventos();
}

function iniciarEventos() {
    document.getElementById("btnEnviarMensaje").onclick = function(){
        nuevoMensaje();
    }
}

function nuevoMensaje(){
    let textArea = document.getElementById("textAreaChat");
    let texto = textArea.value;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "/nuevoMensaje?texto=" + texto, true)
    xhr.send();

    textArea.value = null;
}
