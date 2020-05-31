let tablero = [];    // El tablero donde se hacen todas las operaciones
let tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
let hayPiezaSelec = false;
let piezaSelec = {x: undefined, y: undefined};
let peonAlPaso = {x: undefined, y: undefined};    // Si hay un peon que pueda ser capturado al paso
let piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
let piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
let movPosibles = [];    // Array donde se van a guardar objetos con coordenadas de movimientos posibles
let movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
let movidaEnroqueLargoBlanco = false;
let movidaEnroqueCortoNegro = false;
let movidaEnroqueLargoNegro = false;
let regla50MovBlancas = 0;    // Movimientos consecutivos desde el ultimo movimiento de peon o captura de pieza
let regla50MovNegras = 0;
let regla3RepMovimientos = [];    // Posiciones del tablero para comprobar si alguna se repite 3 veces (seria tablas)
let regla3RepTurnos = [];    // El turno de cada una de las posiciones del array regla3RepMovimientos
let turno = true;    // true = blancas, false = negras
let tableroGirado = false;
let cadenaMovimientos = "";
let resultado = "";
let cadenasTableros = [];    // Array de strings con todas las posiciones de cada turno de la repeticion
let movAnteriorTableros = [];    // Array de coordenadas con todos los movimientos de la repeticion
let jaquesTableros = [];    // Array de booleans con todos los jaques de la repeticion y sus coordenadas
let movActualRep = 0;    // El movimiento de la repeticion que estoy viendo en este momento
let play = false;    // true = repeticion en play, false = repeticion en pause
let intervalo;

window.onload = function () {
    inicializarTablero();
    colocarPiezasIniciales();
    inicializarArraysPiezas();
    inicializarTableroHTML();
    annadirImgPiezasIniciales();
    iniciarEventosTablero();
    iniciarEventoBtnGirar();
};

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero() {
    tablero = new Array(8);
    for (let i = 0, finI = tablero.length; i < finI; i++)
        tablero[i] = new Array(8);
}

function colocarPiezasIniciales() {
    // Casillas en blanco
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            tablero[i][j] = "0";

    // Piezas blancas
    tablero[7][4] = "R";    // Rey
    tablero[7][3] = "D";    // Dama
    tablero[7][2] = "A";    // Alfil
    tablero[7][5] = "A";    // Alfil
    tablero[7][1] = "C";    // Caballo
    tablero[7][6] = "C";    // Caballo
    tablero[7][0] = "T";    // Torre
    tablero[7][7] = "T";    // Torre
    for (let i = 0; i < 8; i++)
        tablero[6][i] = "P";    // Peones

    // Piezas negras
    tablero[0][4] = "r";    // Rey
    tablero[0][3] = "d";    // Dama
    tablero[0][1] = "c";    // Caballo
    tablero[0][6] = "c";    // Caballo
    tablero[0][2] = "a";    // Alfil
    tablero[0][5] = "a";    // Alfil
    tablero[0][0] = "t";    // Torre
    tablero[0][7] = "t";    // Torre
    for (let i = 0; i < 8; i++)
        tablero[1][i] = "p";    // Peones
}

function inicializarArraysPiezas() {
    // Blancas
    piezasBlancas.push({x: 7, y: 4});    // Rey
    piezasBlancas.push({x: 7, y: 3});    // Dama
    piezasBlancas.push({x: 7, y: 2});    // Alfil
    piezasBlancas.push({x: 7, y: 5});    // Alfil
    piezasBlancas.push({x: 7, y: 1});    // Caballo
    piezasBlancas.push({x: 7, y: 6});    // Caballo
    piezasBlancas.push({x: 7, y: 0});    // Torre
    piezasBlancas.push({x: 7, y: 7});    // Torre
    for (let i = 0; i < 8; i++)
        piezasBlancas.push({x: 6, y: i});    // Peones

    // Negras
    piezasNegras.push({x: 0, y: 4});    // Rey
    piezasNegras.push({x: 0, y: 3});    // Dama
    piezasNegras.push({x: 0, y: 2});    // Alfil
    piezasNegras.push({x: 0, y: 5});    // Alfil
    piezasNegras.push({x: 0, y: 1});    // Caballo
    piezasNegras.push({x: 0, y: 6});    // Caballo
    piezasNegras.push({x: 0, y: 0});    // Torre
    piezasNegras.push({x: 0, y: 7});    // Torre
    for (let i = 0; i < 8; i++)
        piezasNegras.push({x: 1, y: i});    // Peones
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

function annadirImgPiezasIniciales() {
    // Blancas
    for (let i = 6; i < 8; i++)
        for (let j = 0; j < 8; j++)
            annadirImgPieza(i, j);

    // Negras
    for (let i = 0; i < 2; i++)
        for (let j = 0; j < 8; j++)
            annadirImgPieza(i, j);
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

function annadirEstiloMovAnterior(x, y) {
    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    tableroHTML[x][y].classList.add("casillasMovAnterior");

    if (tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    tableroHTML[x][y].classList.add("casillasMovAnterior");
}

function eliminarEstiloMovAnterior() {
    let casillasMovAnterior = document.querySelectorAll(".casillasMovAnterior");

    for (let i = 0, finI = casillasMovAnterior.length; i < finI; i++)
        casillasMovAnterior[i].classList.remove("casillasMovAnterior");
}

function annadirEstiloJaque() {
    let piezasColor;

    if (turno)
        piezasColor = piezasNegras;
    else
        piezasColor = piezasBlancas;

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

function eliminarEstiloJaque() {
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

    casillaHTML.classList.remove("reyAmenazado");
    casillaHTML.innerHTML = "";
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

function iniciarEventoBtnGirar() {
    let btnGirar = document.getElementById("btnGirar");
    btnGirar.onclick = function () {
        girar();
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
            else
                realizarMovimientoYComprobaciones(x, y, false);
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

function realizarMovimientoYComprobaciones(x, y, esPromocionPeon) {
    let finDePartida = false;
    let cabecera;
    let parrafo;
    let jaque = false;
    let mate = false;
    // Las siguientes variables son como estaba el tablero antes de mover la pieza. Las necesito para comprobar tablas
    let valorAnteriorCasillaOrigen;
    if (esPromocionPeon) {
        if (turno)
            valorAnteriorCasillaOrigen = "P";
        else
            valorAnteriorCasillaOrigen = "p";
    } else
        valorAnteriorCasillaOrigen = tablero[piezaSelec.x][piezaSelec.y];
    let valorAnteriorCasillaDestino = tablero[x][y];
    let anteriorEnrCortoBlanco = movidaEnroqueCortoBlanco;
    let anteriorEnrLargoBlanco = movidaEnroqueLargoBlanco;
    let anteriorEnrCortoNegro = movidaEnroqueCortoNegro;
    let anteriorEnrLargoNegro = movidaEnroqueLargoNegro;

    let piezasAmbiguedad = obtenerPiezasAmbiguedad(x, y, valorAnteriorCasillaOrigen);
    eliminarEstiloMovAnterior();
    eliminarEstiloJaque();
    moverPieza(x, y);
    let haEnrocado = enroqueYComprobaciones(x, y);
    let haCapturadoAlPAso = capturaAlPasoYComprobaciones(x, y);
    eliminarEstiloMovPosibles();
    annadirEstiloMovAnterior(x, y);

    if (tieneMovimientos()) {
        if (esJaque(turno)) {    // Jaque
            annadirEstiloJaque();
            jaque = true;
        }
    } else {
        finDePartida = true;
        if (esJaque(turno)) {    // Jaque mate
            annadirEstiloJaque();
            mate = true;
            if (turno) {
                resultado = "1-0";
                cabecera = "Ganan las blancas";
            } else {
                resultado = "0-1";
                cabecera = "Ganan las negras";
            }
            parrafo = "Jaque mate";
        } else {    // Rey ahogado
            resultado = "1/2-1/2";
            cabecera = "Tablas"
            parrafo = "Rey agohado";
        }
    }

    escribirMovEnTabla(movANotacion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, x, y, piezasAmbiguedad,
        haEnrocado, haCapturadoAlPAso, jaque, mate));
    deseleccionarPieza();

    if (!finDePartida) {
        if (piezasInsuficientes(piezasBlancas) && piezasInsuficientes(piezasNegras)) {
            finDePartida = true;
            resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "Falta de material para dar mate";
        } else if (tripleRepeticion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, anteriorEnrCortoBlanco,
            anteriorEnrLargoBlanco, anteriorEnrCortoNegro, anteriorEnrLargoNegro)) {
            finDePartida = true;
            resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "Triple repetición de posiciones";
        } else if (regla50Movimientos(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino)) {
            finDePartida = true;
            resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "50 turnos sin mover peón ni realizar capturas";
        }
    }

    movPosibles = [];
    turno = !turno;

    if (finDePartida)
        terminarPartida(cabecera, parrafo);
}

function terminarPartida(cabecera, parrafo) {
    eliminarEventosTablero();
    escribirResultado();
    modalFinDePartida(cabecera, parrafo);
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

function moverPieza(x, y) {
    let come = false;

    // Si come otra pieza, eliminar estilo de la pieza comida
    if (tablero[x][y] !== "0") {
        eliminarImgPieza(x, y);
        come = true;
    }

    // Pone la pieza y el estilo en la nueva posicion
    tablero[x][y] = tablero[piezaSelec.x][piezaSelec.y];
    annadirImgPieza(x, y);

    // Elimina el estilo y la pieza de la anterior posicion
    eliminarImgPieza(piezaSelec.x, piezaSelec.y);
    tablero[piezaSelec.x][piezaSelec.y] = "0";

    if (turno) {
        cambiarObjetoPiezaMovida(piezasBlancas, x, y);
        if (come)
            eliminarObjetoPiezaComida(piezasNegras, x, y);
    } else {
        cambiarObjetoPiezaMovida(piezasNegras, x, y);
        if (come)
            eliminarObjetoPiezaComida(piezasBlancas, x, y);
    }
}

// Cambia las coordenadas de la pieza en el array de objetos
function cambiarObjetoPiezaMovida(piezasColor, x, y) {
    piezasColor.find((pos, i) => {
        if (pos.x === piezaSelec.x && pos.y === piezaSelec.y) {
            piezasColor[i] = {x: x, y: y};
            return true;    // Parar la busqueda
        }
    });
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

// Compruebo si el color contrario al que acaba de mover tiene algun movimiento posible
// Para cada movimiento de cada pieza, compruebo si al hacer ese movimiento el rey de ese color quedaria en jaque
// Si hay al menos un movimiento que sea posible sin colocar a su propio rey en jaque, acaba el bucle y devuelve true
function tieneMovimientos() {
    let puedeMover = false;
    let piezasAmenazadas;

    if (turno)
        piezasAmenazadas = piezasNegras;
    else
        piezasAmenazadas = piezasBlancas;

    let numPiezasAmenazadas = piezasAmenazadas.length;
    let i = 0;
    do {
        movPosibles = [];
        calcularMovSegunPieza(piezasAmenazadas[i].x, piezasAmenazadas[i].y);
        let numMovimientos = movPosibles.length;
        if (numMovimientos > 0) {
            let valorCasillaOrigen = tablero[piezasAmenazadas[i].x][piezasAmenazadas[i].y];
            let j = 0;
            do {
                if (!movAmenazaReyPropio(j, turno, piezasAmenazadas[i], valorCasillaOrigen))
                    puedeMover = true;
                j++;
            } while (j < numMovimientos && !puedeMover);
        }
        i++;
    } while (i < numPiezasAmenazadas && !puedeMover);

    return puedeMover;
}

// Comprueba cuando se mueve el rey o la torre. Ese color no podra hacer enroque
// Comprueba si el movimiento que se acaba de hacer es un enroque y mueve la torre
function enroqueYComprobaciones(x, y) {
    let haEnrocado = {corto: false, largo: false};

    if (tablero[x][y] === "T") {    // Si ha movido torre blanca
        if (piezaSelec.y === 0)
            movidaEnroqueLargoBlanco = true;
        if (piezaSelec.y === 7)
            movidaEnroqueCortoBlanco = true;
    } else if (tablero[x][y] === "t") {    // Si ha movido torre negra
        if (piezaSelec.y === 0)
            movidaEnroqueLargoNegro = true;
        if (piezaSelec.y === 7)
            movidaEnroqueCortoNegro = true;
    } else if (tablero[x][y].toUpperCase() === "R") {    // Si ha movido un rey
        if (Math.abs(piezaSelec.y - y) === 2) {    // Si el movimiento es un enroque (el rey mueve 2 posiciones)
            let x;
            let posYOrigenTorre;
            let posYDestinoTorre;

            if (turno)
                x = 7;
            else
                x = 0;

            if (y === 6) {    // Enroque corto
                posYOrigenTorre = 7;
                posYDestinoTorre = 5;
                haEnrocado.corto = true;
            } else {    // Enroque largo
                posYOrigenTorre = 0;
                posYDestinoTorre = 3;
                haEnrocado.largo = true;
            }

            // Selecciono la torre y la muevo
            seleccionarPieza(x, posYOrigenTorre);
            moverPieza(x, posYDestinoTorre);
            // Vuelvo a seleccionar la casilla de origen del rey
            seleccionarPieza(x, 4);
        }

        if (turno) {
            movidaEnroqueLargoBlanco = true;
            movidaEnroqueCortoBlanco = true;
        } else {
            movidaEnroqueLargoNegro = true;
            movidaEnroqueCortoNegro = true;
        }
    }

    return haEnrocado;
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

// Comprueba cuando un peon mueve dos casillas y lo guarda para que pueda ser capturado al paso
// Comprueba si el movimiento que se acaba de hacer es una captura al paso y elimina el peon capturado
function capturaAlPasoYComprobaciones(x, y) {
    let haCapturadoAlPAso = false;

    // Si la pieza movida es un peon
    if (tablero[x][y].toUpperCase() === "P") {
        // Si ha avanzado dos casillas
        if (Math.abs(piezaSelec.x - x) === 2) {
            peonAlPaso.x = x;
            peonAlPaso.y = y;
        } else {
            if (turno) {
                if (x === peonAlPaso.x - 1) {    // Si las blancas han capturado al paso
                    eliminarImgPieza(x + 1, y);
                    tablero[x + 1][y] = "0";
                    eliminarObjetoPiezaComida(piezasNegras, x + 1, y);
                    haCapturadoAlPAso = true;
                }
            } else {    // Si comen las negras
                if (x === peonAlPaso.x + 1) {    // Si las negras han capturado al paso
                    eliminarImgPieza(x - 1, y);
                    tablero[x - 1][y] = "0";
                    eliminarObjetoPiezaComida(piezasBlancas, x - 1, y);
                    haCapturadoAlPAso = true;
                }
            }
            peonAlPaso.x = undefined;
            peonAlPaso.y = undefined;
        }
    } else {
        peonAlPaso.x = undefined;
        peonAlPaso.y = undefined;
    }

    return haCapturadoAlPAso;
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
        eliminarImgPieza(piezaSelec.x, piezaSelec.y);
        tablero[piezaSelec.x][piezaSelec.y] = nuevaPieza;
        realizarMovimientoYComprobaciones(x, y, true);
    }
}

// Si se da uno de estos casos, devuelve true. Significa que un color no tiene piezas suficientes para ganar
function piezasInsuficientes(piezasColor) {
    let piezasInsuficientes = false;
    let longPiezas = piezasColor.length;

    if (longPiezas === 1)    // Rey solo
        piezasInsuficientes = true;
    else if (longPiezas === 2) {
        if (tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "C")    // Rey y caballo
            piezasInsuficientes = true;
        else if (tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "A")    // Rey y alfil
            piezasInsuficientes = true;
    } else if (longPiezas === 3) {
        if (tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "C" &&
            tablero[piezasColor[2].x][piezasColor[2].y].toUpperCase() === "C")    // Rey y dos caballos
            piezasInsuficientes = true;
    }
    // Rey y varios alfiles, pero todos los alfiles en casilla del mismo color
    if (!piezasInsuficientes && longPiezas > 2) {
        let soloAlfiles = true;

        for (let i = 1; i < longPiezas; i++) {
            if (tablero[piezasColor[i].x][piezasColor[i].y].toUpperCase() !== "A") {
                soloAlfiles = false;
                break;
            }
        }
        if (soloAlfiles) {
            let todosMismoColorCasilla = true;
            let colorCasilla;
            let primerColorCasilla = undefined;

            for (let i = 1; i < longPiezas; i++) {
                if (piezasColor[i].x % 2 === 0)
                    colorCasilla = piezasColor[i].y % 2 === 0;
                else
                    colorCasilla = piezasColor[i].y % 2 !== 0;

                if (i === 1)
                    primerColorCasilla = colorCasilla;
                else {
                    if (primerColorCasilla !== colorCasilla) {
                        todosMismoColorCasilla = false;
                        break;
                    }
                }
            }
            if (todosMismoColorCasilla)
                piezasInsuficientes = true;
        }
    }

    return piezasInsuficientes;
}

function tripleRepeticion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, anteriorEnrCortoBlanco,
                          anteriorEnrLargoBlanco, anteriorEnrCortoNegro, anteriorEnrLargoNegro) {
    let tablas = false;
    let cadena = "";

    // Si el movimiento mueve peon, captura pieza o cambia los enroques posibles, vacio los arrays
    if (valorAnteriorCasillaOrigen.toUpperCase() === "P" || valorAnteriorCasillaDestino !== "0" ||
        anteriorEnrCortoBlanco !== movidaEnroqueCortoBlanco || anteriorEnrLargoBlanco !== movidaEnroqueLargoBlanco ||
        anteriorEnrCortoNegro !== movidaEnroqueCortoNegro || anteriorEnrLargoNegro !== movidaEnroqueLargoNegro) {
        regla3RepMovimientos = [];
        regla3RepTurnos = [];
    }

    // Creo una cadena con el valor de todas las casillas del tablero
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            cadena += tablero[i][j];

    // Guarda en los arrays la cadena actual y el turno actual
    regla3RepMovimientos.push(cadena);
    regla3RepTurnos.push(turno);

    // Comprueba si alguna cadena del array aparece 3 veces (el turno tambien tiene que repetirse)
    if (regla3RepMovimientos.length >= 3) {
        let veces = 1;

        for (let i = 0, finI = regla3RepMovimientos.length - 1; i < finI; i++) {
            veces = 1;
            for (let j = i + 1, finJ = regla3RepMovimientos.length; j < finJ; j++) {
                if (regla3RepMovimientos[i].localeCompare(regla3RepMovimientos[j]) === 0 &&
                    regla3RepTurnos[i] === regla3RepTurnos[j])
                    veces++;
            }
            if (veces >= 3) {
                tablas = true;
                break;
            }
        }
    }

    return tablas;
}

function regla50Movimientos(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino) {
    // Si cualquiera de los colores captura una pieza o mueve un peon, pone los dos contadores a 0
    if (valorAnteriorCasillaOrigen.toUpperCase() === "P" || valorAnteriorCasillaDestino !== "0") {
        regla50MovBlancas = 0;
        regla50MovNegras = 0;
    } else {
        if (turno)
            regla50MovBlancas++;
        else
            regla50MovNegras++;
    }

    return regla50MovBlancas === 50 && regla50MovNegras === 50;
}

function modalFinDePartida(cabecera, parrafo) {
    let modal = document.getElementById("miModal");
    let cerrar = document.getElementById("modalCerrar");
    let titulo = document.getElementById("modalTitulo");
    let body = document.getElementById("modalBody");

    titulo.innerHTML = cabecera;

    let p = document.createElement("P");
    p.innerHTML = parrafo;

    let btnNuevaPartida = document.createElement("BUTTON");
    btnNuevaPartida.innerHTML = "Nueva partida";
    btnNuevaPartida.classList.add("btnBodyModal");

    btnNuevaPartida.onclick = function () {
        modal.style.display = "none";
        titulo.innerHTML = "";
        body.innerHTML = "";
        reiniciarPartida(false);
    }

    let btnVerRepeticion = document.createElement("BUTTON");
    btnVerRepeticion.innerHTML = "Ver repetici&oacute;n";
    btnVerRepeticion.classList.add("btnBodyModal");

    btnVerRepeticion.onclick = function () {
        modal.style.display = "none";
        titulo.innerHTML = "";
        body.innerHTML = "";
        verRepeticion(cadenaMovimientos);
    }

    body.appendChild(p);
    body.appendChild(btnNuevaPartida);
    body.appendChild(btnVerRepeticion);

    // Boton de cerrar el modal
    cerrar.onclick = function () {
        modal.style.display = "none";
        titulo.innerHTML = "";
        body.innerHTML = "";
    }

    // Mostrar el modal
    modal.style.display = "block";
}

// Si le paso true, resetea el tablero y lo prepara para ver la repeticion
// Si le paso false, resetea el tablero y lo prepara para jugar de nuevo
function reiniciarPartida(repeticion) {
    // Elimino todas las imagenes y estilos del tablero
    if (hayPiezaSelec)
        eliminarEstiloMovPosibles();
    eliminarEstiloJaque();
    eliminarEstiloMovAnterior();
    for (let i = 0, finI = piezasBlancas.length; i < finI; i++)
        eliminarImgPieza(piezasBlancas[i].x, piezasBlancas[i].y);
    for (let i = 0, finI = piezasNegras.length; i < finI; i++)
        eliminarImgPieza(piezasNegras[i].x, piezasNegras[i].y);
    if (!repeticion)
        document.getElementById("tablaMov").innerHTML = "";

    if (tableroGirado) {
        girarSpans(document.querySelectorAll("#numeros span"));
        girarSpans(document.querySelectorAll("#letras span"));
    }

    // Vuelvo a poner las variables globales en su valor inicial
    hayPiezaSelec = false;
    piezaSelec = {x: undefined, y: undefined};
    peonAlPaso = {x: undefined, y: undefined};
    piezasBlancas = [];
    piezasNegras = [];
    movPosibles = [];
    movidaEnroqueCortoBlanco = false;
    movidaEnroqueLargoBlanco = false;
    movidaEnroqueCortoNegro = false;
    movidaEnroqueLargoNegro = false;
    regla50MovBlancas = 0;
    regla50MovNegras = 0;
    regla3RepMovimientos = [];
    regla3RepTurnos = [];
    turno = true;
    tableroGirado = false;
    if (!repeticion) {
        cadenaMovimientos = "";
        resultado = "";
    }
    cadenasTableros = [];
    movAnteriorTableros = [];
    jaquesTableros = [];
    movActualRep = 0;
    if (play)
        pararIntervalo();

    // Coloco el tablero, piezas e imagenes e inicio la partida
    colocarPiezasIniciales();
    inicializarArraysPiezas();
    annadirImgPiezasIniciales();
    if (!repeticion)
        iniciarEventosTablero();
}

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
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

function escribirMovEnTabla(notacionMov) {
    let tablaMov = document.getElementById("tablaMov");
    let filas = tablaMov.querySelectorAll(".filaMov");
    let numFilas = filas.length;

    if (turno) {    // Movimiento de las blancas: crea una nuevo div con 3 span y rellena los 2 primeros
        let nuevaFila = document.createElement("div");
        let divNum = document.createElement("div");
        let spanNum = document.createElement("span");
        let divBlancas = document.createElement("div");
        let spanBlancas = document.createElement("span");

        nuevaFila.className = "filaMov";
        divNum.classList.add("divNumMov");
        spanNum.classList.add("spanNumMov");
        spanNum.innerHTML = (numFilas + 1) + ".";
        divBlancas.classList.add("divMov");
        spanBlancas.innerHTML = notacionMov;

        divNum.appendChild(spanNum);
        nuevaFila.appendChild(divNum);
        divBlancas.appendChild(spanBlancas);
        nuevaFila.appendChild(divBlancas);
        tablaMov.appendChild(nuevaFila);

        if (numFilas > 0)
            cadenaMovimientos += " ";
        cadenaMovimientos += (numFilas + 1) + ". " + notacionMov;
    } else {    // Movimiento de las negras: rellena el tercer span del ultimo div
        let divNegras = document.createElement("div");
        let spanNegras = document.createElement("span");

        spanNegras.innerHTML = notacionMov;
        divNegras.classList.add("divMov");

        divNegras.appendChild(spanNegras);
        filas[numFilas - 1].appendChild(divNegras);

        cadenaMovimientos += " " + notacionMov;
    }

    // Mueve el scroll hacia abajo
    tablaMov.scrollTop = tablaMov.scrollHeight;
}

function escribirResultado() {
    let tablaMov = document.getElementById("tablaMov");

    let nuevaFila = document.createElement("div");
    nuevaFila.className = "filaResultado";

    let spanResultado = document.createElement("span");
    spanResultado.innerHTML = resultado;

    nuevaFila.appendChild(spanResultado);
    tablaMov.appendChild(nuevaFila);

    // Mueve el scroll hacia abajo
    tablaMov.scrollTop = tablaMov.scrollHeight;
}

// Obtiene la notacion en texto de un movimiento, usando la notacion algebraica
function movANotacion(tipoOrigen, tipoDestino, x, y, piezasAmbiguedad, haEnrocado, haCapturadoAlPAso, jaque, mate) {
    let notacion = "";
    tipoOrigen = tipoOrigen.toUpperCase();

    if (haEnrocado.corto)
        notacion = "O-O";
    else if (haEnrocado.largo)
        notacion = "O-O-O";
    else {
        // Si no es un peon, annade el tipo de pieza
        if (tipoOrigen !== "P")
            notacion += tipoOrigen;

        // Desambiguacion (annado letra y/o numero para especificar cual de las piezas se mueve)
        if (piezasAmbiguedad.length > 0) {
            let coincideMismaLetra = false;
            let coincideMismoNumero = false;

            for (let i = 0, finI = piezasAmbiguedad.length; i < finI; i++) {
                if (piezaSelec.y === piezasAmbiguedad[i].y)
                    coincideMismaLetra = true;
                if (piezaSelec.x === piezasAmbiguedad[i].x)
                    coincideMismoNumero = true;
            }

            if (!coincideMismaLetra)
                notacion += posicionALetra(piezaSelec.y);
            else {
                if (!coincideMismoNumero)
                    notacion += posicionANumero(piezaSelec.x);
                else
                    notacion += posicionALetra(piezaSelec.y) + posicionANumero(piezaSelec.x);
            }
        }

        // Si captura, annade una x
        if (tipoDestino !== "0" || haCapturadoAlPAso) {
            if (tipoOrigen === "P")    // Si la pieza que captura es peon, annade su letra de origen antes de la x
                notacion += posicionALetra(piezaSelec.y);
            notacion += "x";
        }

        // Annade la nueva casilla
        notacion += posicionALetra(y);
        notacion += posicionANumero(x);

        // Si peon promociona
        if (tipoOrigen === "P" && (x === 0 || x === 7))
            notacion += "=" + tablero[x][y].toUpperCase();
    }
    // Annade si es jaque o mate
    if (jaque)
        notacion += "+";
    else if (mate)
        notacion += "#";

    return notacion;
}

// Compruebo si, aparte de la pieza movida, hay otra pieza del mismo tipo que pueda realizar el mismo movimiento
// Necesito saberlo a la hora de escribir la notacion del movimiento
function obtenerPiezasAmbiguedad(x, y, tipoOrigen) {
    let piezasMismoTipo = [];
    let piezasAmbiguedad = [];

    // Si no es peon ni rey
    if (tipoOrigen.toUpperCase() !== "P" && tipoOrigen.toUpperCase() !== "R") {
        let piezasColor;

        if (turno)
            piezasColor = piezasBlancas;
        else
            piezasColor = piezasNegras;

        // Obtiene las piezas del mismo tipo
        for (let i = 0, finI = piezasColor.length; i < finI; i++) {
            if (tablero[piezasColor[i].x][piezasColor[i].y] === tipoOrigen)
                if (piezaSelec.x !== piezasColor[i].x || piezaSelec.y !== piezasColor[i].y)
                    piezasMismoTipo.push({x: piezasColor[i].x, y: piezasColor[i].y});
        }

        // Obtiene las piezas del mismo tipo que provocan anbiguedad
        if (piezasMismoTipo.length > 0) {
            let movPosiblesAux = movPosibles;

            for (let i = 0, finI = piezasMismoTipo.length; i < finI; i++) {
                movPosibles = [];
                calcularMovSegunPieza(piezasMismoTipo[i].x, piezasMismoTipo[i].y);
                for (let j = 0, finJ = movPosibles.length; j < finJ; j++) {
                    if (x === movPosibles[j].x && y === movPosibles[j].y) {
                        if (!movAmenazaReyPropio(j, !turno, piezasMismoTipo[i], tipoOrigen))
                            piezasAmbiguedad.push(piezasMismoTipo[i]);
                    }
                }
            }

            movPosibles = movPosiblesAux;
        }
    }

    return piezasAmbiguedad;
}

// Relleno la tabla de movimientos con la cadena
// Sin mostrar nada, realizo todos los movimientos, guardando la posicion del tablero en cada turno
// Al darle clic a un movimiento de la tabla, muestra el tablero que he guardado para ese turno
function verRepeticion(cadena) {
    eliminarEventosTablero();
    reiniciarPartida(true);

    cambiarEstilos(document.getElementById("tablaMov"));
    cambiarEstilos(document.getElementById("botonesMov"));
    cambiarEstilos(document.getElementById("btnTodoAtras"));
    cambiarEstilos(document.getElementById("btnAtras"));
    cambiarEstilos(document.getElementById("btnPlayPause"));
    cambiarEstilos(document.getElementById("btnAdelante"));
    cambiarEstilos(document.getElementById("btnTodoAdelante"));

    function cambiarEstilos(elemento) {
        elemento.classList.remove("enPartida");
        elemento.classList.add("enRepeticion");
    }

    cadena = modificarCadena(cadena);
    guardarTablero();
    movAnteriorTableros.push({origenX: undefined, origenY: undefined, destinoX: undefined, destinoY: undefined});
    jaquesTableros.push({esJaque: false, x: undefined, y: undefined});
    cargarCadenaMovimientos(cadena);
    // Muestro el primer movimiento de la partida
    crearEventosMovRepeticion();
    cargarTablero(1);
    estilosMovActualRep(0);
}

// Mi programa funciona con texto tipo PGN (Portable Game Notation) donde las piezas estan en espannol,
// con espacios despues del punto, usando "o" mayuscula en los enroques y usando "#" para el jaque mate.
// Si no es asi, modifico el PGN para adaptarlo
function modificarCadena(cadena) {
    // Si las letras de las piezas estan en ingles, las paso a espannol
    if (cadena.indexOf("B") !== -1 || cadena.indexOf("N") !== -1 ||
        cadena.indexOf("Q") !== -1 || cadena.indexOf("K") !== -1) {
        cadena = cadena.replace(/B/g, "A");
        cadena = cadena.replace(/N/g, "C");
        cadena = cadena.replace(/Q/g, "D");
        cadena = cadena.replace(/R/g, "T");
        cadena = cadena.replace(/K/g, "R");
    }

    // Si el tipo de guion usado para los enroques enroques es distinto, lo cambia
    cadena = cadena.replace(/–/g, "-");

    // Si los enroques estan escritos con ceros, los cambio a "o" mayusculas
    cadena = cadena.replace(/0-0-0/g, "O-O-O");
    cadena = cadena.replace(/0-0/g, "O-O");

    // Si no hay espacios despues del punto, los annado
    cadena = cadena.replace(/[.](?! )/g, ". ");

    // Si el mate esta escrito como "++", lo cambio a "#"
    cadena = cadena.replace("++", "#");

    return cadena;
}

function crearEventosMovRepeticion() {
    let movs = document.querySelectorAll(".spanMovRepeticion");
    let svgPlay = '<svg x="0px" y="0px" viewBox="0 0 47.604 47.604">\n' +
        '<path d="M43.331,21.237L7.233,0.397c-0.917-0.529-2.044-0.529-2.96,0c-0.916,0.528-1.48,\n' +
        '1.505-1.48,2.563v41.684c0,1.058,0.564,2.035,1.48,2.563c0.458,0.268,0.969,0.397,1.48,0.397c0.511,\n' +
        '0,1.022-0.133,1.48-0.397l36.098-20.84c0.918-0.529,1.479-1.506,1.479-2.564S44.247,21.767,\n' +
        '43.331,21.237z"/></svg>';
    let svgPause = '<svg x="0px" y="0px" viewBox="0 0 47.607 47.607">\n' +
        '<path d="M17.991,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,\n' +
        '0-6.631-2.969-6.631-6.631V6.631C4.729,2.969,7.698,0,11.36,0l0,0c3.662,0,6.631,2.969,6.631,\n' +
        '6.631V40.976z"/>\n' +
        '<path d="M42.877,40.976c0,3.662-2.969,6.631-6.631,6.631l0,0c-3.662,0-6.631-2.969-6.631-6.631V6.631\n' +
        'C29.616,2.969,32.585,0,36.246,0l0,0c3.662,0,6.631,2.969,6.631,6.631V40.976z"/></svg>';

    // Eventos de la tabla
    for (let i = 0, finI = movs.length; i < finI; i++) {
        movs[i].onclick = function () {
            estilosMovActualRep(i);
            cargarTablero(i + 1);
            if (play) {
                clearInterval(intervalo);
                if (movActualRep + 1 !== movs.length)    // Si el intervalo esta activo, el contador vuelve a 0ms
                    intervalo = setInterval(avanzarAutomaticamente, 1000);
                else {
                    document.getElementById("btnPlayPause").innerHTML = svgPlay;
                    play = false;
                }
            }
        }
    }

    // Eventos de los botones
    document.getElementById("btnTodoAtras").onclick = function () {
        pararIntervalo();
        estilosMovActualRep(-1);
        cargarTablero(0);
    }

    document.getElementById("btnAtras").onclick = function () {
        pararIntervalo();
        if (movActualRep >= 0) {
            estilosMovActualRep(movActualRep - 1);
            cargarTablero(movActualRep + 1);
        }
    }

    document.getElementById("btnPlayPause").onclick = function () {
        if (!play) {
            pasoAdelante();
            intervalo = setInterval(avanzarAutomaticamente, 1000);
            document.getElementById("btnPlayPause").innerHTML = svgPause;
            play = true;
        } else
            pararIntervalo();
    }

    document.getElementById("btnAdelante").onclick = function () {
        pararIntervalo();
        pasoAdelante();
    }

    document.getElementById("btnTodoAdelante").onclick = function () {
        pararIntervalo();
        estilosMovActualRep(movs.length - 1);
        cargarTablero(movActualRep + 1);
    }

    function avanzarAutomaticamente() {
        pasoAdelante();
        if (movActualRep + 2 === cadenasTableros.length)
            pararIntervalo();
    }

    function pasoAdelante() {
        if (movActualRep + 1 !== movs.length) {
            estilosMovActualRep(movActualRep + 1);
            cargarTablero(movActualRep + 1);
        }
    }
}

function pararIntervalo() {
    let svgPlay = '<svg x="0px" y="0px" viewBox="0 0 47.604 47.604">\n' +
        '<path d="M43.331,21.237L7.233,0.397c-0.917-0.529-2.044-0.529-2.96,0c-0.916,0.528-1.48,\n' +
        '1.505-1.48,2.563v41.684c0,1.058,0.564,2.035,1.48,2.563c0.458,0.268,0.969,0.397,1.48,0.397c0.511,\n' +
        '0,1.022-0.133,1.48-0.397l36.098-20.84c0.918-0.529,1.479-1.506,1.479-2.564S44.247,21.767,\n' +
        '43.331,21.237z"/></svg>';

    clearInterval(intervalo);
    document.getElementById("btnPlayPause").innerHTML = svgPlay;
    play = false;
}

// Colorea el movimiento actual en la tabla, y elimina el coloreado del seleccionado anteriormente
function estilosMovActualRep(n) {
    let spans = document.querySelectorAll(".spanMovRepeticion");

    if (movActualRep !== -1)
        spans[movActualRep].classList.remove("movActualRep");

    movActualRep = n;

    if (movActualRep !== -1)
        spans[n].classList.add("movActualRep");
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

            // Cargo los movimientos realizados
            turno = (i + 2) % 3 === 0;
            notacionAMov(subCadenas[i]);
            guardarTablero();
        }
    }

    // Obtengo el resultado y lo anoto
    fila = document.createElement("div");
    fila.className = "filaResultado";

    let ultimoMov = subCadenas[subCadenas.length - 1];
    let ultimoChar = ultimoMov[ultimoMov.length - 1];

    if (ultimoChar === "#") {
        let penultimoMov = subCadenas[subCadenas.length - 2];
        let ultimoCharUltimoMov = penultimoMov[penultimoMov.length - 1];

        if (ultimoCharUltimoMov === ".")
            resultado = "1-0";
        else
            resultado = "0-1";
    } else
        resultado = "1/2-1/2";

    span = document.createElement("span");
    span.innerHTML = resultado;

    fila.appendChild(span);
    tablaMov.appendChild(fila);
}

function guardarTablero() {
    let cadena = "";

    // Creo una cadena con el valor de todas las casillas del tablero
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            cadena += tablero[i][j];

    cadenasTableros.push(cadena);
}

function cargarTablero(n) {
    let pos = 0;
    let coor = {x: undefined, y: undefined};

    // Rellena el tablero con el valor de la cadena guardada
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Elimino estilos
            tableroHTML[i][j].classList.remove("casillasMovAnterior");
            if (tableroHTML[i][j].classList.contains("reyAmenazado")) {
                tableroHTML[i][j].classList.remove("reyAmenazado");
                tableroHTML[i][j].innerHTML = "";
            }
            // Cambio de pieza
            if (tablero[i][j] !== cadenasTableros[n][pos]) {
                eliminarImgPieza(i, j);
                tablero[i][j] = cadenasTableros[n][pos];
                annadirImgPieza(i, j);
            }
            pos++;
        }
    }

    if (n !== 0) {
        // Annade los estilos del movimiento anterior
        coor.x = movAnteriorTableros[n].origenX;
        coor.y = movAnteriorTableros[n].origenY;
        if (tableroGirado) girarCoorEstilo();
        tableroHTML[coor.x][coor.y].classList.add("casillasMovAnterior");

        coor.x = movAnteriorTableros[n].destinoX;
        coor.y = movAnteriorTableros[n].destinoY;
        if (tableroGirado) girarCoorEstilo();
        tableroHTML[coor.x][coor.y].classList.add("casillasMovAnterior");

        // Annade el estilo del jaque
        if (jaquesTableros[n].esJaque === true) {
            coor.x = jaquesTableros[n].x;
            coor.y = jaquesTableros[n].y;
            if (tableroGirado) girarCoorEstilo();
            tableroHTML[coor.x][coor.y].classList.add("reyAmenazado");
            tableroHTML[coor.x][coor.y].innerHTML = "<div class='piezaResaltadaBorde'></div>";
        }
    }

    function girarCoorEstilo() {
        coor.x = 7 - coor.x;
        coor.y = 7 - coor.y;
    }
}

// Descifra el texto de la notacion y lo convierte en un movimiento en el tablero
function notacionAMov(notacion) {
    let origen = {x: undefined, y: undefined};
    let destino = {x: undefined, y: undefined};
    let captura = notacion.indexOf("x") !== -1;
    let jaque = (notacion[notacion.length - 1] === "+" || notacion[notacion.length - 1] === "#");
    let subString = notacion.replace("x", "");
    subString = subString.replace("+", "");
    subString = subString.replace("#", "");

    if (subString[0] === subString[0].toLowerCase() && subString[0] !== subString[0].toUpperCase()) {    // Peon
        origen.y = letraAPosicion(subString[0]);

        if (subString.length === 2) {
            destino.x = numeroAPosicion(subString[1]);
            destino.y = origen.y;
            if (turno) {
                if (tablero[destino.x + 1][destino.y] === "P")
                    origen.x = destino.x + 1;
                else if (tablero[destino.x + 2][destino.y] === "P")
                    origen.x = destino.x + 2;
            } else {
                if (tablero[destino.x - 1][destino.y] === "p")
                    origen.x = destino.x - 1;
                else if (tablero[destino.x - 2][destino.y] === "p")
                    origen.x = destino.x - 2;
            }

        } else if (captura) {    // Peon captura
            destino.x = numeroAPosicion(subString[2]);
            destino.y = letraAPosicion(subString[1]);
            if (turno)
                origen.x = destino.x + 1;
            else
                origen.x = destino.x - 1;

            if (tablero[destino.x][destino.y] === "0") {    // Peon captura al paso
                if (turno) {
                    eliminarImgPieza(destino.x + 1, destino.y);
                    tablero[destino.x + 1][destino.y] = "0";
                    eliminarObjetoPiezaComida(piezasNegras, destino.x + 1, destino.y);
                } else {
                    eliminarImgPieza(destino.x - 1, destino.y);
                    tablero[destino.x - 1][destino.y] = "0";
                    eliminarObjetoPiezaComida(piezasBlancas, destino.x - 1, destino.y);
                }
            }
        }

        if (notacion.indexOf("=") !== -1) {    // Promocion del peon
            let nuevaPieza = subString[subString.indexOf("=") + 1];
            if (turno)
                origen.x = 1;
            else {
                origen.x = 6;
                nuevaPieza = nuevaPieza.toLowerCase();
            }
            if (notacion.indexOf("x") === -1) {    // Si promociona sin capturar
                destino.x = numeroAPosicion(subString[1]);
                destino.y = letraAPosicion(subString[0]);
            }
            eliminarImgPieza(origen.x, origen.y);
            tablero[origen.x][origen.y] = nuevaPieza;
        }

    } else if (subString[0] === "O") {    // Enroque
        let x;
        let posYOrigenTorre;
        let posYDestinoTorre;

        if (turno)
            x = 7;
        else
            x = 0;

        origen.x = x;
        origen.y = 4;
        destino.x = x;

        if (subString.length === 3) {    // Enroque corto
            destino.y = 6;
            posYOrigenTorre = 7;
            posYDestinoTorre = 5;
        } else {    // Enroque largo
            destino.y = 2;
            posYOrigenTorre = 0;
            posYDestinoTorre = 3;
        }
        seleccionarPieza(x, posYOrigenTorre);
        moverPieza(x, posYDestinoTorre);

    } else {    // Torre, caballo, alfil, dama o rey
        let ambiguedad;
        let origenPieza;
        let tipoPieza = subString[0];

        destino.x = numeroAPosicion(subString[subString.length - 1]);
        destino.y = letraAPosicion(subString[subString.length - 2]);

        if (tipoPieza === "R") {    // Rey
            if (turno) {    // Rey blanco
                origen.x = piezasBlancas[0].x;
                origen.y = piezasBlancas[0].y;
            } else {    // Rey negro
                origen.x = piezasNegras[0].x;
                origen.y = piezasNegras[0].y;
            }
        } else {    // Torre, caballo, alfil o dama
            if (subString.length === 3) {
                ambiguedad = undefined;
                origenPieza = descifrarAmbiguedad(destino, tipoPieza, ambiguedad);
                origen.x = origenPieza.x;
                origen.y = origenPieza.y;
            } else if (subString.length === 4) {
                ambiguedad = subString[1];
                origenPieza = descifrarAmbiguedad(destino, tipoPieza, ambiguedad);
                origen.x = origenPieza.x;
                origen.y = origenPieza.y;
            } else {
                origen.x = numeroAPosicion(subString[2]);
                origen.y = letraAPosicion(subString[1]);
            }
        }
    }
    // Relleno los arrays de estilos
    movAnteriorTableros.push({origenX: origen.x, origenY: origen.y, destinoX: destino.x, destinoY: destino.y});

    if (jaque) {
        let posJaqueX;
        let posJaqueY;

        if (turno) {
            posJaqueX = piezasNegras[0].x;
            posJaqueY = piezasNegras[0].y;
        } else {
            posJaqueX = piezasBlancas[0].x;
            posJaqueY = piezasBlancas[0].y;
        }
        jaquesTableros.push({esJaque: true, x: posJaqueX, y: posJaqueY});
    } else
        jaquesTableros.push({esJaque: false, x: undefined, y: undefined});

    // Realizo el movimiento
    seleccionarPieza(origen.x, origen.y);
    moverPieza(destino.x, destino.y);
}

function descifrarAmbiguedad(destino, tipoPieza, ambiguedad) {
    let piezasAmbiguedad = [];
    let piezasColor;
    let esMismoTipo;
    let origen = {x: undefined, y: undefined};

    if (turno)
        piezasColor = piezasBlancas;
    else {
        piezasColor = piezasNegras;
        tipoPieza = tipoPieza.toLowerCase();
    }

    // Si no hay ambiguedad, guardo en un array todas las piezas del mismo tipo que tipoPieza
    // Si hay ambiguedad, solo guardo las piezas del mismo tipo que tipoPieza que esten en esa letra / numero
    for (let i = 0, finI = piezasColor.length; i < finI; i++) {
        esMismoTipo = false;
        if (tablero[piezasColor[i].x][piezasColor[i].y] === tipoPieza) {
            if (ambiguedad !== undefined) {
                if (isNaN(ambiguedad)) {    // Es letra
                    if (letraAPosicion(ambiguedad) === piezasColor[i].y)
                        esMismoTipo = true;
                } else {    // Es numero
                    if (numeroAPosicion(ambiguedad) === piezasColor[i].x)
                        esMismoTipo = true;
                }
            } else
                esMismoTipo = true;
            if (esMismoTipo)
                piezasAmbiguedad.push({x: piezasColor[i].x, y: piezasColor[i].y});
        }
    }

    // Descarto las piezas que no tienen la casilla de destino como movPosible y me quedo con la pieza que quede
    if (piezasAmbiguedad.length > 1) {
        for (let i = 0, finI = piezasAmbiguedad.length; i < finI; i++) {
            movPosibles = [];
            calcularMovSegunPieza(piezasAmbiguedad[i].x, piezasAmbiguedad[i].y);
            for (let j = 0, finJ = movPosibles.length; j < finJ; j++) {
                if (destino.x === movPosibles[j].x && destino.y === movPosibles[j].y)
                    if (!movAmenazaReyPropio(j, !turno, piezasAmbiguedad[i], tipoPieza)) {
                        origen.x = piezasAmbiguedad[i].x;
                        origen.y = piezasAmbiguedad[i].y;
                    }
            }
        }
    } else {
        origen.x = piezasAmbiguedad[0].x;
        origen.y = piezasAmbiguedad[0].y;
    }

    return origen;
}

function posicionANumero(x) {
    return (8 - x);
}

function numeroAPosicion(x) {
    return (8 - x);
}

function posicionALetra(y) {
    let letra;

    switch (y) {
        case 0:
            letra = "a";
            break;
        case 1:
            letra = "b";
            break;
        case 2:
            letra = "c";
            break;
        case 3:
            letra = "d";
            break;
        case 4:
            letra = "e";
            break;
        case 5:
            letra = "f";
            break;
        case 6:
            letra = "g";
            break;
        case 7:
            letra = "h";
            break;
    }

    return letra;
}

function letraAPosicion(letra) {
    let y;

    switch (letra) {
        case "a":
            y = 0;
            break;
        case "b":
            y = 1;
            break;
        case "c":
            y = 2;
            break;
        case "d":
            y = 3;
            break;
        case "e":
            y = 4;
            break;
        case "f":
            y = 5;
            break;
        case "g":
            y = 6;
            break;
        case "h":
            y = 7;
            break;
    }

    return y;
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
