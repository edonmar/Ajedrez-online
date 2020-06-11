let tablero = [];    // El tablero donde se hacen todas las operaciones
let tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
let hayPiezaSelec = false;
let piezaSelec = {x: undefined, y: undefined};
let movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
let peonAlPaso = {x: undefined, y: undefined};    // Si hay un peon que pueda ser capturado al paso
let piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
let piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
let movidaEnroqueLargoBlanco = false;
let movidaEnroqueCortoNegro = false;
let movidaEnroqueLargoNegro = false;
let tableroGirado = false;
let turno;
let estadoActual;    // Si actualmente es mi turno o no

window.onload = function () {
    cargarMensajes();
    iniciarIntervalos();
    iniciarEventosChat();
    inicializarTablero();
    inicializarTableroHTML();
    iniciarEventoBtnGirar();
    cargarTablero();
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
        if (!estadoActual)
            cargarTablero();
    }, 1000);
}

// Si es el turno del jugador, tiene acceso a los eventos de mover tablero
// Si no es el turno del jugador, llama al intervalo de la llamada ajax que comprueba cuando el otro jugador ha movido
function cambiarEstado(esMiTurno) {
    if (esMiTurno) {
        if (!estadoActual) {
            iniciarEventosTablero();
            estadoActual = true;
        }
    } else {
        if (estadoActual) {
            eliminarEventosTablero();
            estadoActual = false;
        }
    }
}

function iniciarEventosTablero() {
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            tableroHTML[i][j].onclick = function () {
                clickEnCasilla(i, j);
            }
}

function eliminarEventosTablero() {
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            tableroHTML[i][j].onclick = null;
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
    turno = respuesta.colorTurno;
    mostrarTurno(respuesta.colorTurno);
    mostrarTablero(respuesta.casillas);
    if (respuesta.ultimoMov !== "")
        mostrarUltimoMov(respuesta.ultimoMov);
    if (respuesta.jaque)
        mostrarJaque(respuesta.colorTurno);
    cargarCadenaMovimientos(respuesta.pgn);
    cargarEnroques(respuesta.enroques);
    if (respuesta.peonAlPaso !== "")
        cargarPeonAlPaso(respuesta.peonAlPaso);

    let esMiTurno = respuesta.colorTurno === respuesta.miColor;
    cambiarEstado(esMiTurno);
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
            if (tablero[piezasColor[k].x][piezasColor[k].y] === valorRey) {
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

function mostrarJaque(turno) {
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

function annadirEstiloMovPosibles() {
    let x = piezaSelec.x;
    let y = piezaSelec.y;
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let casillaHTML = tableroHTML[x][y];

    // Pieza seleccionada
    casillaHTML.classList.add("piezaSeleccionada");
    casillaHTML.innerHTML = "<div class='piezaResaltadaBorde'></div>";

    // Movimientos posibles
    for (let i = 0, finI = movPosibles.length; i < finI; i++) {
        x = movPosibles[i].x;
        y = movPosibles[i].y;
        if (tableroGirado) {
            x = 7 - x;
            y = 7 - y;
        }
        tableroHTML[x][y].innerHTML = "<div class='movPosible'></div>";
    }
}

function eliminarEstiloMovPosibles() {
    let x = piezaSelec.x;
    let y = piezaSelec.y;
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let casillaHTML = tableroHTML[x][y];

    // Pieza seleccionada
    casillaHTML.classList.remove("piezaSeleccionada");
    if (!casillaHTML.classList.contains("reyAmenazado"))
        casillaHTML.innerHTML = "";

    // Movimientos posibles
    for (let i = 0, finI = movPosibles.length; i < finI; i++) {
        x = movPosibles[i].x;
        y = movPosibles[i].y;
        if (tableroGirado) {
            x = 7 - x;
            y = 7 - y;
        }
        tableroHTML[x][y].innerHTML = "";
    }
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

function cargarEnroques(enroques) {
    if(enroques.indexOf("D") === -1)
        movidaEnroqueLargoBlanco = true;
    if(enroques.indexOf("R") === -1)
        movidaEnroqueCortoBlanco = true;
    if(enroques.indexOf("d") === -1)
        movidaEnroqueLargoNegro = true;
    if(enroques.indexOf("r") === -1)
        movidaEnroqueCortoNegro = true;
}

function cargarPeonAlPaso(alPaso) {
    peonAlPaso.x = parseInt(alPaso[0]);
    peonAlPaso.y = parseInt(alPaso[1]);
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

// Al pulsar una pieza, la selecciono
// Si pulso una casilla a la que no me puedo mover, no pasa nada
// Si pulso una pieza y luego otra, selecciono la segunda
// Si pulso la misma pieza que ya esta seleccionada, la deselecciono
function clickEnCasilla(x, y) {
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }

    let blanca = esBlanca(tablero[x][y]);
    let negra = esNegra(tablero[x][y]);

    if (!hayPiezaSelec) {
        if (turno && blanca || !turno && negra)
            realizarSeleccionPieza(x, y);
    } else {
        if (esMovValido(x, y)) {
            if (siPeonPromociona(x))
                modalPromocionPeon(x, y);
            else {
                enviarMovimiento(x, y, null);
                eliminarEstiloMovPosibles();
                deseleccionarPieza();
                movPosibles = [];
            }
        } else {
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if (x !== piezaSelec.x || y !== piezaSelec.y) {
                // Compruebo que este pulsando una pieza y que sea de mi color
                if (turno && blanca || !turno && negra) {
                    eliminarEstiloMovPosibles();
                    realizarSeleccionPieza(x, y);
                }
            } else {    // Si la pieza pulsada es la que estaba seleccionada, la deselecciono
                eliminarEstiloMovPosibles();
                deseleccionarPieza();
            }
        }
    }
}

function esBlanca(valor) {
    return valor === valor.toUpperCase() && valor !== valor.toLowerCase();
}

function esNegra(valor) {
    return valor === valor.toLowerCase() && valor !== valor.toUpperCase();
}

function realizarSeleccionPieza(x, y) {
    movPosibles = [];
    calcularMovSegunPieza(x, y);
    seleccionarPieza(x, y);
    eliminarMovQueAmenazanAMiRey();
    if (tablero[piezaSelec.x][piezaSelec.y].toUpperCase() === "R")
        annadirEnroquesPosibles();
    annadirEstiloMovPosibles();
}

function enviarMovimiento(x, y, promocionPeon) {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);
            //actualizarTablero(respuesta);
        }
    };

    xhr.open("GET", "/movimiento_y_comprobaciones?partida=" + idPartida + "&origenX=" + piezaSelec.x + "&origenY=" + piezaSelec.y
        + "&destinoX=" + x + "&destinoY=" + y + "&promocionPeon=" + promocionPeon, true);
    xhr.send();
}

function seleccionarPieza(x, y) {
    hayPiezaSelec = true;
    piezaSelec = {x: x, y: y};
}

function deseleccionarPieza() {
    hayPiezaSelec = false;
    piezaSelec = {x: undefined, y: undefined};
}

function esMovValido(x, y) {
    return movPosibles.some(pos => pos.x === x && pos.y === y);
}

// Elimina la pieza comida del array del otro color
function eliminarObjetoPiezaComida(piezasColor, x, y) {
    let posicion = undefined;
    piezasColor.find((pos, i) => {
        if (pos.x === x && pos.y === y) {
            piezasColor.splice(i, 1);
            posicion = i;
            return true;    // Parar la busqueda
        }
    });
    return posicion;
}

// Comprueba todos los movimientos posibles de todas las piezas de un color
// Acaba el bucle y devuelve true si uno de los movimientos es comerse al rey del otro color
function esJaque(colorAmenazante) {
    let movPosiblesAux = movPosibles;
    let piezasAmenazantes;
    let reyAmenazado;
    let jaque = false;

    if (colorAmenazante) {
        piezasAmenazantes = piezasBlancas;
        reyAmenazado = "r";
    } else {
        piezasAmenazantes = piezasNegras;
        reyAmenazado = "R";
    }

    let numPiezasAmenazantes = piezasAmenazantes.length;
    let i = 0;
    do {
        movPosibles = [];
        calcularMovSegunPieza(piezasAmenazantes[i].x, piezasAmenazantes[i].y);
        for (let i = 0, finI = movPosibles.length; i < finI; i++)
            if (tablero[movPosibles[i].x][movPosibles[i].y] === reyAmenazado) {
                jaque = true;
                break;
            }
        i++;
    } while (i < numPiezasAmenazantes && !jaque);

    movPosibles = movPosiblesAux;

    return jaque;
}

// Para cada movimiento posible de la pieza seleccionada:
// Compruebo si al hacer ese movimiento mi rey quedaria en jaque
// Si queda en jaque, elimino ese movimiento de movPosibles
function eliminarMovQueAmenazanAMiRey() {
    if (movPosibles.length > 0) {
        let valorCasillaOrigen = tablero[piezaSelec.x][piezaSelec.y];
        let i = 0;

        do {
            if (movAmenazaReyPropio(i, !turno, piezaSelec, valorCasillaOrigen))
                movPosibles.splice(i, 1);
            else
                i++;
        } while (i < movPosibles.length);
    }
}

// Llamando a la funcion esJaque, compruebo si al hacer un movimiento el rey del color movido quedaria en jaque
function movAmenazaReyPropio(i, colorAmenazante, casillaOrigen, valorCasillaOrigen) {
    let jaque = false;
    let comeNormal = false;
    let comeAlPaso = false;
    let colorComida;
    let posComida;
    let casillaDestinoX = movPosibles[i].x;
    let casillaDestinoY = movPosibles[i].y;
    let valorCasillaDestino = tablero[casillaDestinoX][casillaDestinoY];

    // Compruebo si ha comido de manera normal
    if (esNegra(valorCasillaOrigen) && esBlanca(valorCasillaDestino)) {
        colorComida = piezasBlancas;
        comeNormal = true;
    } else if (esBlanca(valorCasillaOrigen) && esNegra(valorCasillaDestino)) {
        colorComida = piezasNegras;
        comeNormal = true;
    } else if (valorCasillaOrigen.toUpperCase() === "P") {
        if (casillaOrigen.x === peonAlPaso.x && casillaDestinoY === peonAlPaso.y) {    // Si ha comido al paso
            if (casillaDestinoX === peonAlPaso.x - 1) {
                colorComida = piezasNegras;
                comeAlPaso = true;
            } else if (casillaDestinoX === peonAlPaso.x + 1) {
                colorComida = piezasBlancas;
                comeAlPaso = true;
            }
        }
    }

    // Si el movimiento come una pieza, simulo eliminar la pieza comida de su array
    if (comeNormal)
        posComida = eliminarObjetoPiezaComida(colorComida, casillaDestinoX, casillaDestinoY);
    else if (comeAlPaso)
        posComida = eliminarObjetoPiezaComida(colorComida, peonAlPaso.x, peonAlPaso.y);

    // Simulo mover una pieza para ver como quedaria el tablero si hiciera ese movimiento
    tablero[casillaOrigen.x][casillaOrigen.y] = "0";
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaOrigen;
    if (comeAlPaso)
        tablero[peonAlPaso.x][peonAlPaso.y] = "0";

    // Realizo la comprobacion
    if (esJaque(colorAmenazante))
        jaque = true;

    // Vuelvo a colocar las piezas donde estaban antes de simular el movimiento
    tablero[casillaOrigen.x][casillaOrigen.y] = valorCasillaOrigen;
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaDestino;
    if (comeAlPaso) {
        if (colorComida === piezasBlancas)
            tablero[peonAlPaso.x][peonAlPaso.y] = "P";
        if (colorComida === piezasNegras)
            tablero[peonAlPaso.x][peonAlPaso.y] = "p";
    }

    // Vuelvo a colocar la pieza comida (si la hay) en su array, en la posicion donde estaba
    if (comeNormal)
        colorComida.splice(posComida, 0, {x: casillaDestinoX, y: casillaDestinoY});
    else if (comeAlPaso)
        colorComida.splice(posComida, 0, {x: peonAlPaso.x, y: peonAlPaso.y});

    return jaque;
}

// Comprueba si se ha seleccionado un rey y si tiene algun enroque disponible
// Si lo hay, comprueba todos los movimientos posibles de todas las piezas del otro color
// Si ninguno de esos movimientos amenaza al rey o a las casillas por las que pasa, annade el enroque a movPosibles
function annadirEnroquesPosibles() {
    let comprobarEnroqueCorto = false;
    let comprobarEnroqueLargo = false;
    let piezasAmenazantes;
    let x;

    if (turno) {
        piezasAmenazantes = piezasNegras;
        x = 7;
    } else {
        piezasAmenazantes = piezasBlancas;
        x = 0;
    }

    // Enroque corto
    if (turno && !movidaEnroqueCortoBlanco || !turno && !movidaEnroqueCortoNegro)
        if (tablero[x][5] === "0" && tablero[x][6] === "0")
            comprobarEnroqueCorto = true;

    // Enroque largo
    if (turno && !movidaEnroqueLargoBlanco || !turno && !movidaEnroqueLargoNegro)
        if (tablero[x][1] === "0" && tablero[x][2] === "0" && tablero[x][3] === "0")
            comprobarEnroqueLargo = true;

    if (comprobarEnroqueCorto || comprobarEnroqueLargo) {
        let enroqueCortoAmenazado = false;
        let enroqueLargoAmenazado = false;
        let movPosiblesAux = movPosibles;
        let numPiezasAmenazantes = piezasAmenazantes.length;
        let i = 0;

        do {
            movPosibles = [];
            calcularMovSegunPieza(piezasAmenazantes[i].x, piezasAmenazantes[i].y);
            for (let j = 0, finI = movPosibles.length; j < finI; j++) {
                if (movPosibles[j].x === x) {
                    if (movPosibles[j].y === 4) {
                        enroqueCortoAmenazado = true;
                        enroqueLargoAmenazado = true;
                        break;
                    }
                    if (comprobarEnroqueCorto && !enroqueCortoAmenazado)
                        if (movPosibles[j].y === 5 || movPosibles[j].y === 6)
                            enroqueCortoAmenazado = true;
                    if (comprobarEnroqueLargo && !enroqueLargoAmenazado)
                        if (movPosibles[j].y === 3 || movPosibles[j].y === 2 || movPosibles[j].y === 1)
                            enroqueLargoAmenazado = true;
                }
                if (enroqueCortoAmenazado && enroqueLargoAmenazado)
                    break;
            }
            i++;
        } while (i < numPiezasAmenazantes && (!enroqueCortoAmenazado || !enroqueLargoAmenazado));

        movPosibles = movPosiblesAux;

        if (comprobarEnroqueCorto && !enroqueCortoAmenazado)
            movPosibles.push({x: x, y: 6});

        if (comprobarEnroqueLargo && !enroqueLargoAmenazado)
            movPosibles.push({x: x, y: 2});
    }
}

function siPeonPromociona(x) {
    let promociona = false;

    if (x === 0 && tablero[piezaSelec.x][piezaSelec.y] === "P" ||
        x === 7 && tablero[piezaSelec.x][piezaSelec.y] === "p")
        promociona = true;

    return promociona;
}

function modalPromocionPeon(x, y) {
    let modal = document.getElementById("miModal");
    let cerrar = document.getElementById("modalCerrar");
    let titulo = document.getElementById("modalTitulo");
    let body = document.getElementById("modalBody");

    titulo.innerHTML = "Selecciona una pieza";
    body.innerHTML = "";

    // Boton de cerrar el modal sin promocionar
    cerrar.onclick = function () {
        modal.style.display = "none";
    }

    let contenedorBtn = document.createElement("div");

    // Boton dama
    let btnDama = document.createElement("div");
    btnDama.classList.add("btnModal");
    btnDama.innerHTML = "<div class='btnModalBorde'></div>";
    if (turno)
        btnDama.classList.add("damaBlanco");
    else
        btnDama.classList.add("damaNegro");

    btnDama.onclick = function () {
        if (turno)
            promocionarPeon(x, y, "D");
        else
            promocionarPeon(x, y, "d");
    }
    contenedorBtn.appendChild(btnDama);

    // Boton torre
    let btnTorre = document.createElement("div");
    btnTorre.classList.add("btnModal");
    btnTorre.innerHTML = "<div class='btnModalBorde'></div>";
    if (turno)
        btnTorre.classList.add("torreBlanco");
    else
        btnTorre.classList.add("torreNegro");

    btnTorre.onclick = function () {
        if (turno)
            promocionarPeon(x, y, "T");
        else
            promocionarPeon(x, y, "t");
    }
    contenedorBtn.appendChild(btnTorre);

    // Boton alfil
    let btnAlfil = document.createElement("div");
    btnAlfil.classList.add("btnModal");
    btnAlfil.innerHTML = "<div class='btnModalBorde'></div>";
    if (turno)
        btnAlfil.classList.add("alfilBlanco");
    else
        btnAlfil.classList.add("alfilNegro");

    btnAlfil.onclick = function () {
        if (turno)
            promocionarPeon(x, y, "A");
        else
            promocionarPeon(x, y, "a");
    }
    contenedorBtn.appendChild(btnAlfil);

    // Boton caballo
    let btnCaballo = document.createElement("div");
    btnCaballo.classList.add("btnModal");
    btnCaballo.innerHTML = "<div class='btnModalBorde'></div>";
    if (turno)
        btnCaballo.classList.add("caballoBlanco");
    else
        btnCaballo.classList.add("caballoNegro");

    btnCaballo.onclick = function () {
        if (turno)
            promocionarPeon(x, y, "C");
        else
            promocionarPeon(x, y, "c");
    }
    contenedorBtn.appendChild(btnCaballo);

    body.appendChild(contenedorBtn);

    // Mostrar el modal
    modal.style.display = "block";

    function promocionarPeon(x, y, nuevaPieza) {
        modal.style.display = "none";
        titulo.innerHTML = "";
        body.innerHTML = "";
        enviarMovimiento(x, y, nuevaPieza);
        eliminarEstiloMovPosibles();
        deseleccionarPieza();
        movPosibles = [];
    }
}

function calcularMovSegunPieza(x, y) {
    let tipo = tablero[x][y];

    if (tipo === tipo.toUpperCase()) {
        switch (tipo) {
            case "P":
                calcularMovPeonBlanco(x, y);
                break;
            case "T":
                calcularMovTorreBlanco(x, y);
                break;
            case "C":
                calcularMovCaballoBlanco(x, y);
                break;
            case "A":
                calcularMovAlfilBlanco(x, y);
                break;
            case "D":
                calcularMovDamaBlanco(x, y);
                break;
            case "R":
                calcularMovReyBlanco(x, y);
                break;
        }
    } else {
        switch (tipo) {
            case "p":
                calcularMovPeonNegro(x, y);
                break;
            case "t":
                calcularMovTorreNegro(x, y);
                break;
            case "c":
                calcularMovCaballoNegro(x, y);
                break;
            case "a":
                calcularMovAlfilNegro(x, y);
                break;
            case "d":
                calcularMovDamaNegro(x, y);
                break;
            case "r":
                calcularMovReyNegro(x, y);
                break;
        }
    }
}

function calcularMovPeonBlanco(x, y) {
    if (x !== 0) {
        // Una casilla hacia delante
        if (tablero[x - 1][y] === "0")
            movPosibles.push({x: x - 1, y: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esNegra(tablero[x - 1][y - 1]))
                movPosibles.push({x: x - 1, y: y - 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.x === 3 && peonAlPaso.y === y - 1)
                movPosibles.push({x: x - 1, y: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esNegra(tablero[x - 1][y + 1]))
                movPosibles.push({x: x - 1, y: y + 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.x === 3 && peonAlPaso.y === y + 1)
                movPosibles.push({x: x - 1, y: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 6 && tablero[5][y] === "0" && tablero[4][y] === "0")
        movPosibles.push({x: 4, y: y});
}

function calcularMovPeonNegro(x, y) {
    if (x !== 7) {
        // Una casilla hacia delante
        if (tablero[x + 1][y] === "0")
            movPosibles.push({x: x + 1, y: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esBlanca(tablero[x + 1][y - 1]))
                movPosibles.push({x: x + 1, y: y - 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.x === 4 && peonAlPaso.y === y - 1)
                movPosibles.push({x: x + 1, y: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esBlanca(tablero[x + 1][y + 1]))
                movPosibles.push({x: x + 1, y: y + 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.x === 4 && peonAlPaso.y === y + 1)
                movPosibles.push({x: x + 1, y: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 1 && tablero[2][y] === "0" && tablero[3][y] === "0")
        movPosibles.push({x: 3, y: y});
}

function calcularMovTorreBlanco(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (esBlanca(tablero[x - i][y]))
            break;
        movPosibles.push({x: x - i, y: y});
        if (esNegra(tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esBlanca(tablero[x][y + i]))
            break;
        movPosibles.push({x: x, y: y + i});
        if (esNegra(tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esBlanca(tablero[x + i][y]))
            break;
        movPosibles.push({x: x + i, y: y});
        if (esNegra(tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esBlanca(tablero[x][y - i]))
            break;
        movPosibles.push({x: x, y: y - i});
        if (esNegra(tablero[x][y - i]))
            break;
        i++;
    }
}

function calcularMovTorreNegro(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (esNegra(tablero[x - i][y]))
            break;
        movPosibles.push({x: x - i, y: y});
        if (esBlanca(tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esNegra(tablero[x][y + i]))
            break;
        movPosibles.push({x: x, y: y + i});
        if (esBlanca(tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esNegra(tablero[x + i][y]))
            break;
        movPosibles.push({x: x + i, y: y});
        if (esBlanca(tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esNegra(tablero[x][y - i]))
            break;
        movPosibles.push({x: x, y: y - i});
        if (esBlanca(tablero[x][y - i]))
            break;
        i++;
    }
}

function calcularMovCaballoBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esBlanca(tablero[x - 1][y - 2]))
            movPosibles.push({x: x - 1, y: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esBlanca(tablero[x - 2][y - 1]))
            movPosibles.push({x: x - 2, y: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esBlanca(tablero[x - 1][y + 2]))
            movPosibles.push({x: x - 1, y: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esBlanca(tablero[x - 2][y + 1]))
            movPosibles.push({x: x - 2, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esBlanca(tablero[x + 1][y + 2]))
            movPosibles.push({x: x + 1, y: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esBlanca(tablero[x + 2][y + 1]))
            movPosibles.push({x: x + 2, y: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esBlanca(tablero[x + 1][y - 2]))
            movPosibles.push({x: x + 1, y: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esBlanca(tablero[x + 2][y - 1]))
            movPosibles.push({x: x + 2, y: y - 1});
}

function calcularMovCaballoNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esNegra(tablero[x - 1][y - 2]))
            movPosibles.push({x: x - 1, y: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esNegra(tablero[x - 2][y - 1]))
            movPosibles.push({x: x - 2, y: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esNegra(tablero[x - 1][y + 2]))
            movPosibles.push({x: x - 1, y: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esNegra(tablero[x - 2][y + 1]))
            movPosibles.push({x: x - 2, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esNegra(tablero[x + 1][y + 2]))
            movPosibles.push({x: x + 1, y: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esNegra(tablero[x + 2][y + 1]))
            movPosibles.push({x: x + 2, y: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esNegra(tablero[x + 1][y - 2]))
            movPosibles.push({x: x + 1, y: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esNegra(tablero[x + 2][y - 1]))
            movPosibles.push({x: x + 2, y: y - 1});
}

function calcularMovAlfilBlanco(x, y) {
    let i, j;

    // Arriba - Izquierda
    i = 1;
    j = 1;
    while (x - i >= 0 && y - j >= 0) {
        if (esBlanca(tablero[x - i][y - j]))
            break;
        movPosibles.push({x: x - i, y: y - j});
        if (esNegra(tablero[x - i][y - j]))
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (esBlanca(tablero[x - i][y + j]))
            break;
        movPosibles.push({x: x - i, y: y + j});
        if (esNegra(tablero[x - i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (esBlanca(tablero[x + i][y + j]))
            break;
        movPosibles.push({x: x + i, y: y + j});
        if (esNegra(tablero[x + i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (esBlanca(tablero[x + i][y - j]))
            break;
        movPosibles.push({x: x + i, y: y - j});
        if (esNegra(tablero[x + i][y - j]))
            break;
        i++;
        j++;
    }
}

function calcularMovAlfilNegro(x, y) {
    let i, j;

    // Arriba - Izquierda
    i = 1;
    j = 1;
    while (x - i >= 0 && y - j >= 0) {
        if (esNegra(tablero[x - i][y - j]))
            break;
        movPosibles.push({x: x - i, y: y - j});
        if (esBlanca(tablero[x - i][y - j]))
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (esNegra(tablero[x - i][y + j]))
            break;
        movPosibles.push({x: x - i, y: y + j});
        if (esBlanca(tablero[x - i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (esNegra(tablero[x + i][y + j]))
            break;
        movPosibles.push({x: x + i, y: y + j});
        if (esBlanca(tablero[x + i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (esNegra(tablero[x + i][y - j]))
            break;
        movPosibles.push({x: x + i, y: y - j});
        if (esBlanca(tablero[x + i][y - j]))
            break;
        i++;
        j++;
    }
}

function calcularMovDamaBlanco(x, y) {
    calcularMovTorreBlanco(x, y);
    calcularMovAlfilBlanco(x, y);
}

function calcularMovDamaNegro(x, y) {
    calcularMovTorreNegro(x, y);
    calcularMovAlfilNegro(x, y);
}

function calcularMovReyBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (!esBlanca(tablero[x - 1][y - 1]))
            movPosibles.push({x: x - 1, y: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esBlanca(tablero[x - 1][y]))
            movPosibles.push({x: x - 1, y: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esBlanca(tablero[x - 1][y + 1]))
            movPosibles.push({x: x - 1, y: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esBlanca(tablero[x][y + 1]))
            movPosibles.push({x: x, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esBlanca(tablero[x + 1][y + 1]))
            movPosibles.push({x: x + 1, y: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esBlanca(tablero[x + 1][y]))
            movPosibles.push({x: x + 1, y: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esBlanca(tablero[x + 1][y - 1]))
            movPosibles.push({x: x + 1, y: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esBlanca(tablero[x][y - 1]))
            movPosibles.push({x: x, y: y - 1});
}

function calcularMovReyNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (!esNegra(tablero[x - 1][y - 1]))
            movPosibles.push({x: x - 1, y: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esNegra(tablero[x - 1][y]))
            movPosibles.push({x: x - 1, y: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esNegra(tablero[x - 1][y + 1]))
            movPosibles.push({x: x - 1, y: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esNegra(tablero[x][y + 1]))
            movPosibles.push({x: x, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esNegra(tablero[x + 1][y + 1]))
            movPosibles.push({x: x + 1, y: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esNegra(tablero[x + 1][y]))
            movPosibles.push({x: x + 1, y: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esNegra(tablero[x + 1][y - 1]))
            movPosibles.push({x: x + 1, y: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esNegra(tablero[x][y - 1]))
            movPosibles.push({x: x, y: y - 1});
}
