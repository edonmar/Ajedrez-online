let tablero = [];    // El tablero donde se hacen todas las operaciones
let tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
let hayPiezaSelec = false;
let piezaSelec = {posX: undefined, posY: undefined};
let peonAlPaso = {posX: undefined, posY: undefined};    // Si hay un peon que pueda ser capturado al paso
let piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
let piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
let movPosibles = [];    // Array donde se van a guardar objetos con coordenadas de movimientos posibles
let movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
let movidaEnroqueLargoBlanco = false;
let movidaEnroqueCortoNegro = false;
let movidaEnroqueLargoNegro = false;
let turno = true;    // true = blancas, false = negras

window.onload = function () {
    inicializarTablero();
    colocarPiezasIniciales();
    inicializarArraysPiezas();
    inicializarTableroHTML();
    annadirImgPiezasIniciales();
    iniciarEventosTablero();
};

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero() {
    tablero = new Array(8);
    for (let i = 0, fin = tablero.length; i < fin; i++)
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
    piezasBlancas.push({posX: 7, posY: 4});    // Rey
    piezasBlancas.push({posX: 7, posY: 3});    // Dama
    piezasBlancas.push({posX: 7, posY: 2});    // Alfil
    piezasBlancas.push({posX: 7, posY: 5});    // Alfil
    piezasBlancas.push({posX: 7, posY: 1});    // Caballo
    piezasBlancas.push({posX: 7, posY: 6});    // Caballo
    piezasBlancas.push({posX: 7, posY: 0});    // Torre
    piezasBlancas.push({posX: 7, posY: 7});    // Torre
    for (let i = 0; i < 8; i++)
        piezasBlancas.push({posX: 6, posY: i});    // Peones

    // Negras
    piezasNegras.push({posX: 0, posY: 4});    // Rey
    piezasNegras.push({posX: 0, posY: 3});    // Dama
    piezasNegras.push({posX: 0, posY: 2});    // Alfil
    piezasNegras.push({posX: 0, posY: 5});    // Alfil
    piezasNegras.push({posX: 0, posY: 1});    // Caballo
    piezasNegras.push({posX: 0, posY: 6});    // Caballo
    piezasNegras.push({posX: 0, posY: 0});    // Torre
    piezasNegras.push({posX: 0, posY: 7});    // Torre
    for (let i = 0; i < 8; i++)
        piezasNegras.push({posX: 1, posY: i});    // Peones
}

// Asigna a la variable tableroHTML un array de 8x8 con las celdas HTML
function inicializarTableroHTML() {
    let filas, casillasDeLaFila;

    filas = document.querySelectorAll("tr");
    for (let i = 0, fin = filas.length; i < fin; i++) {
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
    let piezaHTML = tableroHTML[x][y];
    let tipo = tablero[x][y];

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
    let piezaHTML = tableroHTML[x][y];
    let tipo = tablero[x][y];

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
    // Pieza seleccionada
    tableroHTML[piezaSelec.posX][piezaSelec.posY].classList.add("piezaSeleccionada");
    tableroHTML[piezaSelec.posX][piezaSelec.posY].innerHTML = "<div class='piezaResaltadaBorde'></div>";

    // Movimientos posibles
    for (let i = 0, fin = movPosibles.length; i < fin; i++)
        tableroHTML[movPosibles[i].posX][movPosibles[i].posY].innerHTML = "<div class='movPosible'></div>";
}

function eliminarEstiloMovPosibles() {
    // Pieza seleccionada
    tableroHTML[piezaSelec.posX][piezaSelec.posY].classList.remove("piezaSeleccionada");
    if (!tableroHTML[piezaSelec.posX][piezaSelec.posY].classList.contains("reyAmenazado"))
        tableroHTML[piezaSelec.posX][piezaSelec.posY].innerHTML = "";

    // Movimientos posibles
    for (let i = 0, fin = movPosibles.length; i < fin; i++)
        tableroHTML[movPosibles[i].posX][movPosibles[i].posY].innerHTML = "";
}

function annadirEstiloJaque() {
    let piezasColor;

    if (turno)
        piezasColor = piezasNegras;
    else
        piezasColor = piezasBlancas;

    tableroHTML[piezasColor[0].posX][piezasColor[0].posY].classList.add("reyAmenazado");
    tableroHTML[piezasColor[0].posX][piezasColor[0].posY].innerHTML = "<div class='piezaResaltadaBorde'></div>";
}

function eliminarEstiloJaque() {
    let piezasColor;

    if (turno)
        piezasColor = piezasBlancas;
    else
        piezasColor = piezasNegras;

    tableroHTML[piezasColor[0].posX][piezasColor[0].posY].classList.remove("reyAmenazado");
    tableroHTML[piezasColor[0].posX][piezasColor[0].posY].innerHTML = "";
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

// Al pulsar una pieza, la selecciono
// Si pulso una casilla a la que no me puedo mover, no pasa nada
// Si pulso una pieza y luego otra, selecciono la segunda
// Si pulso la misma pieza que ya esta seleccionada, la deselecciono
function clickEnCasilla(x, y) {
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
                realizarMovimientoYComprobaciones(x, y);
        } else {
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if (x !== piezaSelec.posX || y !== piezaSelec.posY) {
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
    if (tablero[piezaSelec.posX][piezaSelec.posY].toUpperCase() === "R")
        annadirEnroquesPosibles();
    annadirEstiloMovPosibles();
}

function realizarMovimientoYComprobaciones(x, y) {
    let finDePartida = false;
    let cabecera;
    let parrafo;

    eliminarEstiloJaque();
    moverPieza(x, y);
    enroqueYComprobaciones(x, y);
    capturaAlPasoYComprobaciones(x, y);
    eliminarEstiloMovPosibles();
    deseleccionarPieza();
    if (tieneMovimientos()) {
        if (esJaque(turno))    // Jaque
            annadirEstiloJaque();
    } else {
        if (esJaque(turno)) {    // Jaque mate
            annadirEstiloJaque();
            finDePartida = true;
            if (turno)
                cabecera = "Ganan las blancas";
            else
                cabecera = "Ganan las negras";
            parrafo = "Jaque mate";
        } else {    // Rey ahogado
            finDePartida = true;
            cabecera = "Tablas"
            parrafo = "Rey agohado";
        }
    }
    movPosibles = [];
    turno = !turno;

    if (finDePartida) {
        terminarPartida(cabecera, parrafo);
    }
}

function terminarPartida(cabecera, parrafo) {
    eliminarEventosTablero();
    modalFinDePartida(cabecera, parrafo);
}

function seleccionarPieza(x, y) {
    hayPiezaSelec = true;
    piezaSelec = {posX: x, posY: y};
}

function deseleccionarPieza() {
    hayPiezaSelec = false;
    piezaSelec = {posX: undefined, posY: undefined};
}

function esMovValido(x, y) {
    return movPosibles.some(pos => pos.posX === x && pos.posY === y);
}

function moverPieza(x, y) {
    let come = false;

    // Si come otra pieza, eliminar estilo de la pieza comida
    if (tablero[x][y] !== "0") {
        eliminarImgPieza(x, y);
        come = true;
    }

    // Pone la pieza y el estilo en la nueva posicion
    tablero[x][y] = tablero[piezaSelec.posX][piezaSelec.posY];
    annadirImgPieza(x, y);

    // Elimina el estilo y la pieza de la anterior posicion
    eliminarImgPieza(piezaSelec.posX, piezaSelec.posY);
    tablero[piezaSelec.posX][piezaSelec.posY] = "0";

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
        if (pos.posX === piezaSelec.posX && pos.posY === piezaSelec.posY) {
            piezasColor[i] = {posX: x, posY: y};
            return true;    // Parar la busqueda
        }
    });
}

// Comprueba si ha comido una pieza y eliminar la pieza comida del array del otro color
function eliminarObjetoPiezaComida(piezasColor, x, y) {
    let posicion = undefined;
    piezasColor.find((pos, i) => {
        if (pos.posX === x && pos.posY === y) {
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
        calcularMovSegunPieza(piezasAmenazantes[i].posX, piezasAmenazantes[i].posY);
        for (let i = 0, fin = movPosibles.length; i < fin; i++)
            if (tablero[movPosibles[i].posX][movPosibles[i].posY] === reyAmenazado) {
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
        let valorCasillaOrigen = tablero[piezaSelec.posX][piezaSelec.posY];
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
function movAmenazaReyPropio(x, color, casillaOrigen, valorCasillaOrigen) {
    let jaque = false;
    let comeNormal = false;
    let comeAlPaso = false;
    let colorComida;
    let posComida;
    let casillaDestinoX = movPosibles[x].posX;
    let casillaDestinoY = movPosibles[x].posY;
    let valorCasillaDestino = tablero[casillaDestinoX][casillaDestinoY];

    // Compruebo si ha comido de manera normal
    if (esNegra(valorCasillaOrigen) && esBlanca(valorCasillaDestino)) {
        colorComida = piezasBlancas;
        comeNormal = true;
    } else if (esBlanca(valorCasillaOrigen) && esNegra(valorCasillaDestino)) {
        colorComida = piezasNegras;
        comeNormal = true;
    } else if (valorCasillaOrigen.toUpperCase() === "P") {
        if (casillaOrigen.posX === peonAlPaso.posX && casillaDestinoY === peonAlPaso.posY) {    // Si ha comido al paso
            if (casillaDestinoX === peonAlPaso.posX - 1) {
                colorComida = piezasNegras;
                comeAlPaso = true;
            } else if (casillaDestinoX === peonAlPaso.posX + 1) {
                colorComida = piezasBlancas;
                comeAlPaso = true;
            }
        }
    }

    // Si el movimiento come una pieza, simulo eliminar la pieza comida de su array
    if (comeNormal)
        posComida = eliminarObjetoPiezaComida(colorComida, casillaDestinoX, casillaDestinoY);
    else if (comeAlPaso)
        posComida = eliminarObjetoPiezaComida(colorComida, peonAlPaso.posX, peonAlPaso.posY);

    // Simulo mover una pieza para ver como quedaria el tablero si hiciera ese movimiento
    tablero[casillaOrigen.posX][casillaOrigen.posY] = "0";
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaOrigen;
    if (comeAlPaso)
        tablero[peonAlPaso.posX][peonAlPaso.posY] = "0";

    // Realizo la comprobacion
    if (esJaque(color))
        jaque = true;

    // Vuelvo a colocar las piezas donde estaban antes de simular el movimiento
    tablero[casillaOrigen.posX][casillaOrigen.posY] = valorCasillaOrigen;
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaDestino;
    if (comeAlPaso) {
        if (colorComida === piezasBlancas)
            tablero[peonAlPaso.posX][peonAlPaso.posY] = "P";
        if (colorComida === piezasNegras)
            tablero[peonAlPaso.posX][peonAlPaso.posY] = "p";
    }

    // Vuelvo a colocar la pieza comida (si la hay) en su array, en la posicion donde estaba
    if (comeNormal)
        colorComida.splice(posComida, 0, {posX: casillaDestinoX, posY: casillaDestinoY});
    else if (comeAlPaso)
        colorComida.splice(posComida, 0, {posX: peonAlPaso.posX, posY: peonAlPaso.posY});

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
        calcularMovSegunPieza(piezasAmenazadas[i].posX, piezasAmenazadas[i].posY);
        let numMovimientos = movPosibles.length;
        if (numMovimientos > 0) {
            let valorCasillaOrigen = tablero[piezasAmenazadas[i].posX][piezasAmenazadas[i].posY];
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
    if (tablero[x][y] === "T") {    // Si ha movido torre blanca
        if (y === 0)
            movidaEnroqueLargoBlanco = true;
        if (y === 7)
            movidaEnroqueCortoBlanco = true;
    } else if (tablero[x][y] === "t") {    // Si ha movido torre negra
        if (y === 0)
            movidaEnroqueLargoNegro = true;
        if (y === 7)
            movidaEnroqueCortoNegro = true;
    } else if (tablero[x][y].toUpperCase() === "R") {    // Si ha movido un rey
        if (Math.abs(piezaSelec.posY - y) === 2) {    // Si el movimiento es un enroque (el rey mueve 2 posiciones)
            let posX;
            let posYOrigenTorre;
            let posYDestinoTorre;

            if (turno)
                posX = 7;
            else
                posX = 0;

            if (y === 6) {    // Enroque corto
                posYOrigenTorre = 7;
                posYDestinoTorre = 5;
            } else {    // Enroque largo
                posYOrigenTorre = 0;
                posYDestinoTorre = 3;
            }

            // Selecciono la torre y la muevo
            seleccionarPieza(posX, posYOrigenTorre);
            moverPieza(posX, posYDestinoTorre);
            // Vuelvo a seleccionar la casilla de origen del rey
            seleccionarPieza(posX, 4);
        }

        if (turno) {
            movidaEnroqueLargoBlanco = true;
            movidaEnroqueCortoBlanco = true;
        } else {
            movidaEnroqueLargoNegro = true;
            movidaEnroqueCortoNegro = true;
        }
    }
}

// Comprueba si se ha seleccionado un rey y si tiene algun enroque disponible
// Si lo hay, comprueba todos los movimientos posibles de todas las piezas del otro color
// Si ninguno de esos movimientos amenaza al rey o a las casillas por las que pasa, annade el enroque a movPosibles
function annadirEnroquesPosibles() {
    let comprobarEnroqueCorto = false;
    let comprobarEnroqueLargo = false;
    let piezasAmenazantes;
    let posX;

    if (turno) {
        piezasAmenazantes = piezasNegras;
        posX = 7;
    } else {
        piezasAmenazantes = piezasBlancas;
        posX = 0;
    }

    // Enroque corto
    if (turno && !movidaEnroqueCortoBlanco || !turno && !movidaEnroqueCortoNegro)
        if (tablero[posX][5] === "0" && tablero[posX][6] === "0")
            comprobarEnroqueCorto = true;

    // Enroque largo
    if (turno && !movidaEnroqueLargoBlanco || !turno && !movidaEnroqueLargoNegro)
        if (tablero[posX][1] === "0" && tablero[posX][2] === "0" && tablero[posX][3] === "0")
            comprobarEnroqueLargo = true;

    if (comprobarEnroqueCorto || comprobarEnroqueLargo) {
        let enroqueCortoAmenazado = false;
        let enroqueLargoAmenazado = false;
        let movPosiblesAux = movPosibles;
        let numPiezasAmenazantes = piezasAmenazantes.length;
        let i = 0;

        do {
            movPosibles = [];
            calcularMovSegunPieza(piezasAmenazantes[i].posX, piezasAmenazantes[i].posY);
            for (let j = 0, fin = movPosibles.length; j < fin; j++) {
                if (movPosibles[j].posX === posX) {
                    if (movPosibles[j].posY === 4) {
                        enroqueCortoAmenazado = true;
                        enroqueLargoAmenazado = true;
                        break;
                    }
                    if (comprobarEnroqueCorto && !enroqueCortoAmenazado)
                        if (movPosibles[j].posY === 5 || movPosibles[j].posY === 6)
                            enroqueCortoAmenazado = true;
                    if (comprobarEnroqueLargo && !enroqueLargoAmenazado)
                        if (movPosibles[j].posY === 3 || movPosibles[j].posY === 2 || movPosibles[j].posY === 1)
                            enroqueLargoAmenazado = true;
                }
                if (enroqueCortoAmenazado && enroqueLargoAmenazado)
                    break;
            }
            i++;
        } while (i < numPiezasAmenazantes && (!enroqueCortoAmenazado || !enroqueLargoAmenazado));

        movPosibles = movPosiblesAux;

        if (comprobarEnroqueCorto && !enroqueCortoAmenazado)
            movPosibles.push({posX: posX, posY: 6});

        if (comprobarEnroqueLargo && !enroqueLargoAmenazado)
            movPosibles.push({posX: posX, posY: 2});
    }
}

// Comprueba cuando un peon mueve dos casillas y lo guarda para que pueda ser capturado al paso
// Comprueba si el movimiento que se acaba de hacer es una captura al paso y elimina el peon capturado
function capturaAlPasoYComprobaciones(x, y) {
    // Si la pieza movida es un peon
    if (tablero[x][y].toUpperCase() === "P") {
        // Si ha avanzado dos casillas
        if (Math.abs(piezaSelec.posX - x) === 2) {
            peonAlPaso.posX = x;
            peonAlPaso.posY = y;
        } else {
            // Si ha comido al paso
            if (turno) {
                if (x === peonAlPaso.posX - 1) {    // Si comen las blancas
                    eliminarImgPieza(x + 1, y);
                    tablero[x + 1][y] = "0";
                    eliminarObjetoPiezaComida(piezasNegras, x + 1, y);
                }
            } else {    // Si comen las negras
                if (x === peonAlPaso.posX + 1) {
                    eliminarImgPieza(x - 1, y);
                    tablero[x - 1][y] = "0";
                    eliminarObjetoPiezaComida(piezasBlancas, x - 1, y);
                }
            }
            peonAlPaso.posX = undefined;
            peonAlPaso.posY = undefined;
        }
    } else {
        peonAlPaso.posX = undefined;
        peonAlPaso.posY = undefined;
    }
}

function siPeonPromociona(x) {
    let promociona = false;

    if (x === 0 && tablero[piezaSelec.posX][piezaSelec.posY] === "P" ||
        x === 7 && tablero[piezaSelec.posX][piezaSelec.posY] === "p")
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

    // Boton dama
    let btnDama = document.createElement("button");
    btnDama.classList.add("btnModal");
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
    body.appendChild(btnDama);

    // Boton torre
    let btnTorre = document.createElement("button");
    btnTorre.classList.add("btnModal");
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
    body.appendChild(btnTorre);

    // Boton alfil
    let btnAlfil = document.createElement("button");
    btnAlfil.classList.add("btnModal");
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
    body.appendChild(btnAlfil);

    // Boton caballo
    let btnCaballo = document.createElement("button");
    btnCaballo.classList.add("btnModal");
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
    body.appendChild(btnCaballo);

    // Mostrar el modal
    modal.style.display = "block";

    function promocionarPeon(x, y, nuevaPieza) {
        modal.style.display = "none";
        eliminarImgPieza(piezaSelec.posX, piezaSelec.posY);
        tablero[piezaSelec.posX][piezaSelec.posY] = nuevaPieza;
        realizarMovimientoYComprobaciones(x, y, true);
    }
}

function modalFinDePartida(cabecera, parrafo) {
    let modal = document.getElementById("miModal");
    let cerrar = document.getElementById("modalCerrar");
    let titulo = document.getElementById("modalTitulo");
    let body = document.getElementById("modalBody");

    titulo.innerHTML = cabecera;
    body.innerHTML = "<p>" + parrafo + "</p>";

    // Boton de cerrar el modal
    cerrar.onclick = function () {
        modal.style.display = "none";
    }

    // Mostrar el modal
    modal.style.display = "block";
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
            movPosibles.push({posX: x - 1, posY: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esNegra(tablero[x - 1][y - 1]))
                movPosibles.push({posX: x - 1, posY: y - 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.posX === 3 && peonAlPaso.posY === y - 1)
                movPosibles.push({posX: x - 1, posY: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esNegra(tablero[x - 1][y + 1]))
                movPosibles.push({posX: x - 1, posY: y + 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.posX === 3 && peonAlPaso.posY === y + 1)
                movPosibles.push({posX: x - 1, posY: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 6 && tablero[5][y] === "0" && tablero[4][y] === "0")
        movPosibles.push({posX: 4, posY: y});
}

function calcularMovPeonNegro(x, y) {
    if (x !== 7) {
        // Una casilla hacia delante
        if (tablero[x + 1][y] === "0")
            movPosibles.push({posX: x + 1, posY: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esBlanca(tablero[x + 1][y - 1]))
                movPosibles.push({posX: x + 1, posY: y - 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.posX === 4 && peonAlPaso.posY === y - 1)
                movPosibles.push({posX: x + 1, posY: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esBlanca(tablero[x + 1][y + 1]))
                movPosibles.push({posX: x + 1, posY: y + 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.posX === 4 && peonAlPaso.posY === y + 1)
                movPosibles.push({posX: x + 1, posY: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 1 && tablero[2][y] === "0" && tablero[3][y] === "0")
        movPosibles.push({posX: 3, posY: y});
}

function calcularMovTorreBlanco(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (esBlanca(tablero[x - i][y]))
            break;
        movPosibles.push({posX: x - i, posY: y});
        if (esNegra(tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esBlanca(tablero[x][y + i]))
            break;
        movPosibles.push({posX: x, posY: y + i});
        if (esNegra(tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esBlanca(tablero[x + i][y]))
            break;
        movPosibles.push({posX: x + i, posY: y});
        if (esNegra(tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esBlanca(tablero[x][y - i]))
            break;
        movPosibles.push({posX: x, posY: y - i});
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
        movPosibles.push({posX: x - i, posY: y});
        if (esBlanca(tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esNegra(tablero[x][y + i]))
            break;
        movPosibles.push({posX: x, posY: y + i});
        if (esBlanca(tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esNegra(tablero[x + i][y]))
            break;
        movPosibles.push({posX: x + i, posY: y});
        if (esBlanca(tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esNegra(tablero[x][y - i]))
            break;
        movPosibles.push({posX: x, posY: y - i});
        if (esBlanca(tablero[x][y - i]))
            break;
        i++;
    }
}

function calcularMovCaballoBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esBlanca(tablero[x - 1][y - 2]))
            movPosibles.push({posX: x - 1, posY: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esBlanca(tablero[x - 2][y - 1]))
            movPosibles.push({posX: x - 2, posY: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esBlanca(tablero[x - 1][y + 2]))
            movPosibles.push({posX: x - 1, posY: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esBlanca(tablero[x - 2][y + 1]))
            movPosibles.push({posX: x - 2, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esBlanca(tablero[x + 1][y + 2]))
            movPosibles.push({posX: x + 1, posY: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esBlanca(tablero[x + 2][y + 1]))
            movPosibles.push({posX: x + 2, posY: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esBlanca(tablero[x + 1][y - 2]))
            movPosibles.push({posX: x + 1, posY: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esBlanca(tablero[x + 2][y - 1]))
            movPosibles.push({posX: x + 2, posY: y - 1});
}

function calcularMovCaballoNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esNegra(tablero[x - 1][y - 2]))
            movPosibles.push({posX: x - 1, posY: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esNegra(tablero[x - 2][y - 1]))
            movPosibles.push({posX: x - 2, posY: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esNegra(tablero[x - 1][y + 2]))
            movPosibles.push({posX: x - 1, posY: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esNegra(tablero[x - 2][y + 1]))
            movPosibles.push({posX: x - 2, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esNegra(tablero[x + 1][y + 2]))
            movPosibles.push({posX: x + 1, posY: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esNegra(tablero[x + 2][y + 1]))
            movPosibles.push({posX: x + 2, posY: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esNegra(tablero[x + 1][y - 2]))
            movPosibles.push({posX: x + 1, posY: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esNegra(tablero[x + 2][y - 1]))
            movPosibles.push({posX: x + 2, posY: y - 1});
}

function calcularMovAlfilBlanco(x, y) {
    let i, j;

    // Arriba - Izquierda
    i = 1;
    j = 1;
    while (x - i >= 0 && y - j >= 0) {
        if (esBlanca(tablero[x - i][y - j]))
            break;
        movPosibles.push({posX: x - i, posY: y - j});
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
        movPosibles.push({posX: x - i, posY: y + j});
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
        movPosibles.push({posX: x + i, posY: y + j});
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
        movPosibles.push({posX: x + i, posY: y - j});
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
        movPosibles.push({posX: x - i, posY: y - j});
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
        movPosibles.push({posX: x - i, posY: y + j});
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
        movPosibles.push({posX: x + i, posY: y + j});
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
        movPosibles.push({posX: x + i, posY: y - j});
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
            movPosibles.push({posX: x - 1, posY: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esBlanca(tablero[x - 1][y]))
            movPosibles.push({posX: x - 1, posY: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esBlanca(tablero[x - 1][y + 1]))
            movPosibles.push({posX: x - 1, posY: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esBlanca(tablero[x][y + 1]))
            movPosibles.push({posX: x, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esBlanca(tablero[x + 1][y + 1]))
            movPosibles.push({posX: x + 1, posY: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esBlanca(tablero[x + 1][y]))
            movPosibles.push({posX: x + 1, posY: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esBlanca(tablero[x + 1][y - 1]))
            movPosibles.push({posX: x + 1, posY: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esBlanca(tablero[x][y - 1]))
            movPosibles.push({posX: x, posY: y - 1});
}

function calcularMovReyNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (!esNegra(tablero[x - 1][y - 1]))
            movPosibles.push({posX: x - 1, posY: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esNegra(tablero[x - 1][y]))
            movPosibles.push({posX: x - 1, posY: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esNegra(tablero[x - 1][y + 1]))
            movPosibles.push({posX: x - 1, posY: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esNegra(tablero[x][y + 1]))
            movPosibles.push({posX: x, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esNegra(tablero[x + 1][y + 1]))
            movPosibles.push({posX: x + 1, posY: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esNegra(tablero[x + 1][y]))
            movPosibles.push({posX: x + 1, posY: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esNegra(tablero[x + 1][y - 1]))
            movPosibles.push({posX: x + 1, posY: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esNegra(tablero[x][y - 1]))
            movPosibles.push({posX: x, posY: y - 1});
}
