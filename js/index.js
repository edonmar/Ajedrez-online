let tablero = [];    // El tablero donde se hacen todas las operaciones
let tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
let hayPiezaSelec = false;
let piezaSelec = {posX: undefined, posY: undefined};
let peonAlPaso = {posX: undefined, posY: undefined};    // Si hay un peon que pueda ser capturado al paso
let piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
let piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
let movPosibles = [];    // Array donde se van a guardar objetos con coordenadas de movimientos posibles
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
            tablero[i][j] = 0;

    // Piezas blancas
    for (let i = 0; i < 8; i++)
        tablero[6][i] = 1;    // Peones
    tablero[7][0] = 2;    // Torre
    tablero[7][1] = 3;    // Caballo
    tablero[7][2] = 4;    // Alfil
    tablero[7][3] = 5;    // Reina
    tablero[7][4] = 6;    // Rey
    tablero[7][5] = 4;    // Alfil
    tablero[7][6] = 3;    // Caballo
    tablero[7][7] = 2;    // Torre

    // Piezas negras
    for (let i = 0; i < 8; i++)
        tablero[1][i] = -1;    // Peones
    tablero[0][0] = -2;    // Torre
    tablero[0][1] = -3;    // Caballo
    tablero[0][2] = -4;    // Alfil
    tablero[0][3] = -5;    // Reina
    tablero[0][4] = -6;    // Rey
    tablero[0][5] = -4;    // Alfil
    tablero[0][6] = -3;    // Caballo
    tablero[0][7] = -2;    // Torre
}

function inicializarArraysPiezas() {
    // Blancas
    piezasBlancas.push({posX: 7, posY: 4});    // Rey
    piezasBlancas.push({posX: 7, posY: 3});    // Reina
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
    piezasNegras.push({posX: 0, posY: 3});    // Reina
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

    switch (tipo) {
        case 1:
            piezaHTML.classList.add("peonBlanco");
            break;
        case -1:
            piezaHTML.classList.add("peonNegro");
            break;

        case 2:
            piezaHTML.classList.add("torreBlanco");
            break;
        case -2:
            piezaHTML.classList.add("torreNegro");
            break;

        case 3:
            piezaHTML.classList.add("caballoBlanco");
            break;
        case -3:
            piezaHTML.classList.add("caballoNegro");
            break;

        case 4:
            piezaHTML.classList.add("alfilBlanco");
            break;
        case -4:
            piezaHTML.classList.add("alfilNegro");
            break;

        case 5:
            piezaHTML.classList.add("reinaBlanco");
            break;
        case -5:
            piezaHTML.classList.add("reinaNegro");
            break;

        case 6:
            piezaHTML.classList.add("reyBlanco");
            break;
        case -6:
            piezaHTML.classList.add("reyNegro");
            break;
    }
}

function eliminarImgPieza(x, y) {
    let piezaHTML = tableroHTML[x][y];
    let tipo = tablero[x][y];

    switch (tipo) {
        case 1:
            piezaHTML.classList.remove("peonBlanco");
            break;
        case -1:
            piezaHTML.classList.remove("peonNegro");
            break;

        case 2:
            piezaHTML.classList.remove("torreBlanco");
            break;
        case -2:
            piezaHTML.classList.remove("torreNegro");
            break;

        case 3:
            piezaHTML.classList.remove("caballoBlanco");
            break;
        case -3:
            piezaHTML.classList.remove("caballoNegro");
            break;

        case 4:
            piezaHTML.classList.remove("alfilBlanco");
            break;
        case -4:
            piezaHTML.classList.remove("alfilNegro");
            break;

        case 5:
            piezaHTML.classList.remove("reinaBlanco");
            break;
        case -5:
            piezaHTML.classList.remove("reinaNegro");
            break;

        case 6:
            piezaHTML.classList.remove("reyBlanco");
            break;
        case -6:
            piezaHTML.classList.remove("reyNegro");
            break;
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
            tableroHTML[i][j].addEventListener("click", function () {
                clickEnCasilla(i, j);
            });
}

// Al pulsar una pieza, la selecciono
// Si pulso una casilla a la que no me puedo mover, no pasa nada
// Si pulso una pieza y luego otra, selecciono la segunda
// Si pulso la misma pieza que ya esta seleccionada, la deselecciono
function clickEnCasilla(i, j) {
    if (!hayPiezaSelec) {
        if (turno && tablero[i][j] > 0 || !turno && tablero[i][j] < 0) {
            movPosibles = [];
            calcularMovSegunPieza(i, j);
            seleccionarPieza(i, j);
            eliminarMovQueAmenazanAMiRey();
            annadirEstiloMovPosibles();
        }
    } else {
        if (esMovValido(i, j)) {
            eliminarEstiloJaque();
            moverPieza(i, j);
            comerAlPaso(i, j);
            eliminarEstiloMovPosibles();
            deseleccionarPieza();
            if (tieneMovimientos()) {
                if (esJaque(turno)) {    // Jaque
                    annadirEstiloJaque();
                }
            } else {
                if (esJaque(turno)) {    // Jaque mate
                    annadirEstiloJaque();
                } else {    // Rey ahogado

                }
            }
            movPosibles = [];
            turno = !turno;
        } else {
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if (i !== piezaSelec.posX || j !== piezaSelec.posY) {
                // Compruebo que este pulsando una pieza y que sea de mi color
                if (turno && tablero[i][j] > 0 || !turno && tablero[i][j] < 0) {
                    eliminarEstiloMovPosibles();
                    movPosibles = [];
                    calcularMovSegunPieza(i, j);
                    seleccionarPieza(i, j);
                    eliminarMovQueAmenazanAMiRey();
                    annadirEstiloMovPosibles();
                }
            } else {    // Si la pieza pulsada es la que estaba seleccionada, la deselecciono
                eliminarEstiloMovPosibles();
                deseleccionarPieza();
            }
        }
    }
}

function seleccionarPieza(i, j) {
    hayPiezaSelec = true;
    piezaSelec = {posX: i, posY: j};
}

function deseleccionarPieza() {
    hayPiezaSelec = false;
    piezaSelec = {posX: undefined, posY: undefined};
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
        reyAmenazado = -6;
    } else {
        piezasAmenazantes = piezasNegras;
        reyAmenazado = 6;
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

// Llamando a la funcion esJaque, compruebo si al hacer un movimiento el rey del color movido quedaria en jaque
function movAmenazaReyPropio(i, color, casillaOrigen, valorCasillaOrigen) {
    let jaque = false;
    let comeNormal = false;
    let comeAlPaso = false;
    let colorComida;
    let posComida;
    let casillaDestinoX = movPosibles[i].posX;
    let casillaDestinoY = movPosibles[i].posY;
    let valorCasillaDestino = tablero[casillaDestinoX][casillaDestinoY];

    // Compruebo si ha comido de manera normal
    if (valorCasillaOrigen < 0 && valorCasillaDestino > 0) {
        colorComida = piezasBlancas;
        comeNormal = true;
    } else if (valorCasillaOrigen > 0 && valorCasillaDestino < 0) {
        colorComida = piezasNegras;
        comeNormal = true;
    } else if (Math.abs(valorCasillaOrigen) === 1) {    // Compruebo si ha comido al paso
        if (casillaOrigen.posX === peonAlPaso.posX && casillaDestinoY === peonAlPaso.posY) {
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
    tablero[casillaOrigen.posX][casillaOrigen.posY] = 0;
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaOrigen;
    if (comeAlPaso)
        tablero[peonAlPaso.posX][peonAlPaso.posY] = 0;

    // Realizo la comprobacion
    if (esJaque(color))
        jaque = true;

    // Vuelvo a colocar las piezas donde estaban antes de simular el movimiento
    tablero[casillaOrigen.posX][casillaOrigen.posY] = valorCasillaOrigen;
    tablero[casillaDestinoX][casillaDestinoY] = valorCasillaDestino;
    if (comeAlPaso) {
        if (colorComida === piezasBlancas)
            tablero[peonAlPaso.posX][peonAlPaso.posY] = 1;
        if (colorComida === piezasNegras)
            tablero[peonAlPaso.posX][peonAlPaso.posY] = -1;
    }

    // Vuelvo a colocar la pieza comida (si la hay) en su array, en la posicion donde estaba
    if (comeNormal)
        colorComida.splice(posComida, 0, {posX: casillaDestinoX, posY: casillaDestinoY});
    else if (comeAlPaso)
        colorComida.splice(posComida, 0, {posX: peonAlPaso.posX, posY: peonAlPaso.posY});

    return jaque;
}

function esMovValido(x, y) {
    return movPosibles.some(pos => pos.posX === x && pos.posY === y);
}

function moverPieza(x, y) {
    let come = false;

    // Si come otra pieza, eliminar estilo de la pieza comida
    if (tablero[x][y] !== 0) {
        eliminarImgPieza(x, y);
        come = true;
    }

    // Pone la pieza y el estilo en la nueva posicion
    tablero[x][y] = tablero[piezaSelec.posX][piezaSelec.posY];
    annadirImgPieza(x, y);

    // Elimina el estilo y la pieza de la anterior posicion
    eliminarImgPieza(piezaSelec.posX, piezaSelec.posY);
    tablero[piezaSelec.posX][piezaSelec.posY] = 0;

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

// Comprueba cuando un peon mueve dos casillas y lo guarda para que pueda ser capturado al paso
// Comprueba si el movimiento que se acaba de hacer es una captura al paso y elimina el peon capturado
function comerAlPaso(i, j) {
    // Si la pieza movida es un peon
    if (Math.abs(tablero[i][j]) === 1) {
        // Si ha avanzado dos casillas
        if (Math.abs(piezaSelec.posX - i) === 2) {
            peonAlPaso.posX = i;
            peonAlPaso.posY = j;
        } else {
            // Si ha comido al paso
            if (turno) {
                if (i === peonAlPaso.posX - 1) {    // Si comen las blancas
                    eliminarImgPieza(i + 1, j);
                    tablero[i + 1][j] = 0;
                    eliminarObjetoPiezaComida(piezasNegras, i + 1, j);
                }
            } else {    // Si comen las negras
                if (i === peonAlPaso.posX + 1) {
                    eliminarImgPieza(i - 1, j);
                    tablero[i - 1][j] = 0;
                    eliminarObjetoPiezaComida(piezasBlancas, i - 1, j);
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

function calcularMovSegunPieza(x, y) {
    let tipo = tablero[x][y];

    switch (tipo) {
        case 1:
            calcularMovPeonBlanco(x, y);
            break;
        case -1:
            calcularMovPeonNegro(x, y);
            break;

        case 2:
            calcularMovTorreBlanca(x, y);
            break;
        case -2:
            calcularMovTorreNegra(x, y);
            break;

        case 3:
            calcularMovCaballoBlanco(x, y);
            break;
        case -3:
            calcularMovCaballoNegro(x, y);
            break;

        case 4:
            calcularMovAlfilBlanco(x, y);
            break;
        case -4:
            calcularMovAlfilNegro(x, y);
            break;

        case 5:
            calcularMovReinaBlanca(x, y);
            break;
        case -5:
            calcularMovReinaNegra(x, y);
            break;

        case 6:
            calcularMovReyBlanco(x, y);
            break;
        case -6:
            calcularMovReyNegro(x, y);
            break;
    }
}

function calcularMovPeonBlanco(x, y) {
    if (x !== 0) {
        // Una casilla hacia delante
        if (tablero[x - 1][y] === 0)
            movPosibles.push({posX: x - 1, posY: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (tablero[x - 1][y - 1] < 0)
                movPosibles.push({posX: x - 1, posY: y - 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.posX === 3 && peonAlPaso.posY === y - 1)
                movPosibles.push({posX: x - 1, posY: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (tablero[x - 1][y + 1] < 0)
                movPosibles.push({posX: x - 1, posY: y + 1});
            // Comer al paso
            if (x === 3 && peonAlPaso.posX === 3 && peonAlPaso.posY === y + 1)
                movPosibles.push({posX: x - 1, posY: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 6 && tablero[5][y] === 0 && tablero[4][y] === 0)
        movPosibles.push({posX: 4, posY: y});
}

function calcularMovPeonNegro(x, y) {
    if (x !== 7) {
        // Una casilla hacia delante
        if (tablero[x + 1][y] === 0)
            movPosibles.push({posX: x + 1, posY: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (tablero[x + 1][y - 1] > 0)
                movPosibles.push({posX: x + 1, posY: y - 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.posX === 4 && peonAlPaso.posY === y - 1)
                movPosibles.push({posX: x + 1, posY: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (tablero[x + 1][y + 1] > 0)
                movPosibles.push({posX: x + 1, posY: y + 1});
            // Comer al paso
            if (x === 4 && peonAlPaso.posX === 4 && peonAlPaso.posY === y + 1)
                movPosibles.push({posX: x + 1, posY: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 1 && tablero[2][y] === 0 && tablero[3][y] === 0)
        movPosibles.push({posX: 3, posY: y});
}

function calcularMovTorreBlanca(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (tablero[x - i][y] > 0)
            break;
        movPosibles.push({posX: x - i, posY: y});
        if (tablero[x - i][y] < 0)
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (tablero[x][y + i] > 0)
            break;
        movPosibles.push({posX: x, posY: y + i});
        if (tablero[x][y + i] < 0)
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (tablero[x + i][y] > 0)
            break;
        movPosibles.push({posX: x + i, posY: y});
        if (tablero[x + i][y] < 0)
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (tablero[x][y - i] > 0)
            break;
        movPosibles.push({posX: x, posY: y - i});
        if (tablero[x][y - i] < 0)
            break;
        i++;
    }
}

function calcularMovTorreNegra(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (tablero[x - i][y] < 0)
            break;
        movPosibles.push({posX: x - i, posY: y});
        if (tablero[x - i][y] > 0)
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (tablero[x][y + i] < 0)
            break;
        movPosibles.push({posX: x, posY: y + i});
        if (tablero[x][y + i] > 0)
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (tablero[x + i][y] < 0)
            break;
        movPosibles.push({posX: x + i, posY: y});
        if (tablero[x + i][y] > 0)
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (tablero[x][y - i] < 0)
            break;
        movPosibles.push({posX: x, posY: y - i});
        if (tablero[x][y - i] > 0)
            break;
        i++;
    }
}

function calcularMovCaballoBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (tablero[x - 1][y - 2] <= 0)
            movPosibles.push({posX: x - 1, posY: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (tablero[x - 2][y - 1] <= 0)
            movPosibles.push({posX: x - 2, posY: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (tablero[x - 1][y + 2] <= 0)
            movPosibles.push({posX: x - 1, posY: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (tablero[x - 2][y + 1] <= 0)
            movPosibles.push({posX: x - 2, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (tablero[x + 1][y + 2] <= 0)
            movPosibles.push({posX: x + 1, posY: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (tablero[x + 2][y + 1] <= 0)
            movPosibles.push({posX: x + 2, posY: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (tablero[x + 1][y - 2] <= 0)
            movPosibles.push({posX: x + 1, posY: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (tablero[x + 2][y - 1] <= 0)
            movPosibles.push({posX: x + 2, posY: y - 1});
}

function calcularMovCaballoNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (tablero[x - 1][y - 2] >= 0)
            movPosibles.push({posX: x - 1, posY: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (tablero[x - 2][y - 1] >= 0)
            movPosibles.push({posX: x - 2, posY: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (tablero[x - 1][y + 2] >= 0)
            movPosibles.push({posX: x - 1, posY: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (tablero[x - 2][y + 1] >= 0)
            movPosibles.push({posX: x - 2, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (tablero[x + 1][y + 2] >= 0)
            movPosibles.push({posX: x + 1, posY: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (tablero[x + 2][y + 1] >= 0)
            movPosibles.push({posX: x + 2, posY: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (tablero[x + 1][y - 2] >= 0)
            movPosibles.push({posX: x + 1, posY: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (tablero[x + 2][y - 1] >= 0)
            movPosibles.push({posX: x + 2, posY: y - 1});
}

function calcularMovAlfilBlanco(x, y) {
    let i, j;

    // Arriba - Izquierda
    i = 1;
    j = 1;
    while (x - i >= 0 && y - j >= 0) {
        if (tablero[x - i][y - j] > 0)
            break;
        movPosibles.push({posX: x - i, posY: y - j});
        if (tablero[x - i][y - j] < 0)
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (tablero[x - i][y + j] > 0)
            break;
        movPosibles.push({posX: x - i, posY: y + j});
        if (tablero[x - i][y + j] < 0)
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (tablero[x + i][y + j] > 0)
            break;
        movPosibles.push({posX: x + i, posY: y + j});
        if (tablero[x + i][y + j] < 0)
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (tablero[x + i][y - j] > 0)
            break;
        movPosibles.push({posX: x + i, posY: y - j});
        if (tablero[x + i][y - j] < 0)
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
        if (tablero[x - i][y - j] < 0)
            break;
        movPosibles.push({posX: x - i, posY: y - j});
        if (tablero[x - i][y - j] > 0)
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (tablero[x - i][y + j] < 0)
            break;
        movPosibles.push({posX: x - i, posY: y + j});
        if (tablero[x - i][y + j] > 0)
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (tablero[x + i][y + j] < 0)
            break;
        movPosibles.push({posX: x + i, posY: y + j});
        if (tablero[x + i][y + j] > 0)
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (tablero[x + i][y - j] < 0)
            break;
        movPosibles.push({posX: x + i, posY: y - j});
        if (tablero[x + i][y - j] > 0)
            break;
        i++;
        j++;
    }
}

function calcularMovReinaBlanca(x, y) {
    calcularMovTorreBlanca(x, y);
    calcularMovAlfilBlanco(x, y);
}

function calcularMovReinaNegra(x, y) {
    calcularMovTorreNegra(x, y);
    calcularMovAlfilNegro(x, y);
}

function calcularMovReyBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (tablero[x - 1][y - 1] <= 0)
            movPosibles.push({posX: x - 1, posY: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (tablero[x - 1][y] <= 0)
            movPosibles.push({posX: x - 1, posY: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (tablero[x - 1][y + 1] <= 0)
            movPosibles.push({posX: x - 1, posY: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (tablero[x][y + 1] <= 0)
            movPosibles.push({posX: x, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (tablero[x + 1][y + 1] <= 0)
            movPosibles.push({posX: x + 1, posY: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (tablero[x + 1][y] <= 0)
            movPosibles.push({posX: x + 1, posY: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (tablero[x + 1][y - 1] <= 0)
            movPosibles.push({posX: x + 1, posY: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (tablero[x][y - 1] <= 0)
            movPosibles.push({posX: x, posY: y - 1});
}

function calcularMovReyNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (tablero[x - 1][y - 1] >= 0)
            movPosibles.push({posX: x - 1, posY: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (tablero[x - 1][y] >= 0)
            movPosibles.push({posX: x - 1, posY: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (tablero[x - 1][y + 1] >= 0)
            movPosibles.push({posX: x - 1, posY: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (tablero[x][y + 1] >= 0)
            movPosibles.push({posX: x, posY: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (tablero[x + 1][y + 1] >= 0)
            movPosibles.push({posX: x + 1, posY: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (tablero[x + 1][y] >= 0)
            movPosibles.push({posX: x + 1, posY: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (tablero[x + 1][y - 1] >= 0)
            movPosibles.push({posX: x + 1, posY: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (tablero[x][y - 1] >= 0)
            movPosibles.push({posX: x, posY: y - 1});
}
