let tablero = [];    // El tablero donde se hacen todas las operaciones
let tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
let movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
let peonAlPaso = {x: undefined, y: undefined};    // Si hay un peon que pueda ser capturado al paso
let piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
let piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
let movidaEnroqueLargoBlanco = false;
let movidaEnroqueCortoNegro = false;
let movidaEnroqueLargoNegro = false;
let tableroGirado = false;

window.onload = function () {
    cargarMensajes();
    iniciarIntervalos();
    iniciarEventosChat();

    inicializarTablero();
    inicializarTableroHTML();
    iniciarEventoBtnGirar();
    cargarTablero();
    //colocarPiezasIniciales();
    //inicializarArraysPiezas();
    //annadirImgPiezasIniciales();
    //iniciarEventosTablero();
}

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero() {
    tablero = new Array(8);
    for (let i = 0, finI = tablero.length; i < finI; i++)
        tablero[i] = new Array(8);

    // Casillas en blanco
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            tablero[i][j] = "0";
}

// Asigna a la variable tableroHTML un array de 8x8 con las celdas HTML
function inicializarTableroHTML() {
    let filas, casillasDeLaFila;

    filas = document.querySelectorAll("tr");
    for (let i = 0, finI = filas.length; i < finI; i++) {
        casillasDeLaFila = filas[i].querySelectorAll("td");
        tableroHTML.push(casillasDeLaFila);
    }
}

function iniciarIntervalos() {
    setInterval(function () {
        cargarMensajes();
    }, 1000);
}

function iniciarEventosChat() {
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

    xhr.open("GET", "/nuevo_mensaje_partida?partida=" + idPartida + "&texto=" + texto, true);
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

    xhr.open("GET", "/cargar_mensajes_partida?partida=" + idPartida, true);
    xhr.send();
}

function iniciarEventoBtnGirar() {
    let btnGirar = document.getElementById("btnGirar");
    btnGirar.onclick = function () {
        girar();
    }
}

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
    girarNombres();
    tableroGirado = !tableroGirado;
}

function girarTablero() {
    let casillaA;
    let casillaB;
    let htmlAux;
    let classAux;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            casillaA = tableroHTML[i][j];
            htmlAux = casillaA.innerHTML;
            classAux = casillaA.className;
            casillaB = tableroHTML[7 - i][7 - j];

            casillaA.innerHTML = casillaB.innerHTML;
            casillaA.className = casillaB.className;

            casillaB.innerHTML = htmlAux;
            casillaB.className = classAux;
        }
    }
}

function girarSpans(spans) {
    let spanA;
    let spanB;
    let htmlAux;

    for (let i = 0; i < 4; i++) {
        spanA = spans[i];
        htmlAux = spanA.innerHTML;
        spanB = spans[7 - i];

        spanA.innerHTML = spanB.innerHTML;
        spanB.innerHTML = htmlAux;
    }
}

function girarNombres() {
    let nombreA = document.querySelector(".nombreBlancas");
    let nombreB = document.querySelector(".nombreNegras");
    let nombreAux = nombreA.innerHTML;
    let classAux = nombreA.className;

    nombreA.innerHTML = nombreB.innerHTML;
    nombreB.innerHTML = nombreAux;

    nombreA.className = nombreB.className;
    nombreB.className = classAux;
}

function cargarTablero() {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);
            actualizarTablero(respuesta);
        }
    };

    xhr.open("GET", "/cargar_tablero?partida=" + idPartida, true);
    xhr.send();
}

function actualizarTablero(respuesta) {
    mostrarTurno(respuesta.turno);
    mostrarTablero(respuesta.casillas);
    mostrarUltimoMov(respuesta.ultimoMov);
    if(respuesta.jaque)
        mostrarJaque(respuesta.turno);
    cargarCadenaMovimientos(respuesta.pgn);
}

function mostrarTurno(turno) {
    let suTurno;
    let noSuTurno;

    if (turno) {
        suTurno = document.querySelector(".nombreBlancas");
        noSuTurno = document.querySelector(".nombreNegras");
    } else {
        suTurno = document.querySelector(".nombreNegras");
        noSuTurno = document.querySelector(".nombreBlancas");
    }

    suTurno.classList.add("suTurno");
    noSuTurno.classList.remove("suTurno");
}

function mostrarTablero(casillas) {
    let pos = 0;
    piezasBlancas = [];
    piezasNegras = [];

    // Rellena el tablero con el valor de la cadena guardada
    // Tambien relleno los array de piezas
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Elimino estilos
            tableroHTML[i][j].classList.remove("casillasMovAnterior");
            if (tableroHTML[i][j].classList.contains("reyAmenazado")) {
                tableroHTML[i][j].classList.remove("reyAmenazado");
                tableroHTML[i][j].innerHTML = "";
            }

            // Cambio de pieza
            if (tablero[i][j] !== casillas[pos]) {
                eliminarImgPieza(i, j);
                tablero[i][j] = casillas[pos];
                annadirImgPieza(i, j);
            }

            if (esBlanca(casillas[pos]))
                piezasBlancas.push({x: i, y: j});
            else if (esNegra(casillas[pos]))
                piezasNegras.push({x: i, y: j});

            pos++;
        }
    }

    setReyPrimeraPos(piezasBlancas, "R");
    setReyPrimeraPos(piezasNegras, "r");

    function setReyPrimeraPos(piezasColor, valorRey) {
        for (let k = 0, finK = piezasColor.length; k < finK; k++) {
            if(tablero[piezasColor[k].x][piezasColor[k].y] === valorRey){
                let reyX = piezasColor[k].x;
                let reyY = piezasColor[k].y;

                piezasColor.splice(k, 1);
                piezasColor.unshift({x: reyX, y: reyY});
            }
        }
    }
}

function mostrarUltimoMov(ultimoMov) {
    let origenX = ultimoMov[0];
    let origenY = ultimoMov[1];
    let destinoX = ultimoMov[2];
    let destinoY = ultimoMov[3];

    annadirEstiloMovAnterior(origenX, origenY);
    annadirEstiloMovAnterior(destinoX, destinoY);
}

function mostrarJaque(turno){
    let piezasColor;

    if (turno)
        piezasColor = piezasBlancas;
    else
        piezasColor = piezasNegras;

    let x = piezasColor[0].x;
    let y = piezasColor[0].y;
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let casillaHTML = tableroHTML[x][y];

    casillaHTML.classList.add("reyAmenazado");
    casillaHTML.innerHTML = "<div class='piezaResaltadaBorde'></div>";
}

function annadirEstiloMovAnterior(x, y) {
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    tableroHTML[x][y].classList.add("casillasMovAnterior");
}

// Rellena la tabla de movimientos con el string de los movimientos de la repeticion
// Y llama a la funcion que realiza los movimientos
function cargarCadenaMovimientos(cadena) {
    let tablaMov = document.getElementById("tablaMov");

    tablaMov.innerHTML = "";

    let subCadenas = cadena.split(" ");
    let fila = undefined;
    let div;
    let span;

    for (let i = 0, finI = subCadenas.length; i < finI; i++) {
        if (i % 3 === 0) {    // Crear fila y rellenar numero
            fila = document.createElement("div");
            div = document.createElement("div");
            span = document.createElement("span");

            fila.className = "filaMov";
            div.classList.add("divNumMov");
            span.classList.add("spanNumMov");
            span.innerHTML = subCadenas[i];

            div.appendChild(span);
            fila.appendChild(div);
            tablaMov.appendChild(fila);
        } else {
            // Rellenar los movimientos de la fila
            div = document.createElement("div");
            span = document.createElement("span");

            div.classList.add("divMov");
            span.classList.add("spanMovRepeticion");
            span.innerHTML = subCadenas[i];

            div.appendChild(span);
            fila.appendChild(div);
        }
    }
}

function annadirImgPieza(x, y) {
    let tipo = tablero[x][y];
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let piezaHTML = tableroHTML[x][y];

    if (tipo === tipo.toUpperCase()) {
        switch (tipo) {
            case "P":
                piezaHTML.classList.add("peonBlanco");
                break;
            case "T":
                piezaHTML.classList.add("torreBlanco");
                break;
            case "C":
                piezaHTML.classList.add("caballoBlanco");
                break;
            case "A":
                piezaHTML.classList.add("alfilBlanco");
                break;
            case "D":
                piezaHTML.classList.add("damaBlanco");
                break;
            case "R":
                piezaHTML.classList.add("reyBlanco");
                break;
        }
    } else {
        switch (tipo) {
            case "p":
                piezaHTML.classList.add("peonNegro");
                break;
            case "t":
                piezaHTML.classList.add("torreNegro");
                break;
            case "c":
                piezaHTML.classList.add("caballoNegro");
                break;
            case "a":
                piezaHTML.classList.add("alfilNegro");
                break;
            case "d":
                piezaHTML.classList.add("damaNegro");
                break;
            case "r":
                piezaHTML.classList.add("reyNegro");
                break;
        }
    }
}

function eliminarImgPieza(x, y) {
    let tipo = tablero[x][y];
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let piezaHTML = tableroHTML[x][y];

    if (tipo === tipo.toUpperCase()) {
        switch (tipo) {
            case "P":
                piezaHTML.classList.remove("peonBlanco");
                break;
            case "T":
                piezaHTML.classList.remove("torreBlanco");
                break;
            case "C":
                piezaHTML.classList.remove("caballoBlanco");
                break;
            case "A":
                piezaHTML.classList.remove("alfilBlanco");
                break;
            case "D":
                piezaHTML.classList.remove("damaBlanco");
                break;
            case "R":
                piezaHTML.classList.remove("reyBlanco");
                break;
        }
    } else {
        switch (tipo) {
            case "p":
                piezaHTML.classList.remove("peonNegro");
                break;
            case "t":
                piezaHTML.classList.remove("torreNegro");
                break;
            case "c":
                piezaHTML.classList.remove("caballoNegro");
                break;
            case "a":
                piezaHTML.classList.remove("alfilNegro");
                break;
            case "d":
                piezaHTML.classList.remove("damaNegro");
                break;
            case "r":
                piezaHTML.classList.remove("reyNegro");
                break;
        }
    }
}

function esBlanca(valor) {
    return valor === valor.toUpperCase() && valor !== valor.toLowerCase();
}

function esNegra(valor) {
    return valor === valor.toLowerCase() && valor !== valor.toUpperCase();
}
