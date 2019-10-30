var tablero = [];    // El tablero donde se hacen todas las operaciones
var tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
var hayPiezaSelec = false;
var piezaSelec = {posX: undefined, posY: undefined};
var movPosibles = [];

window.onload = function(){
    inicializarTablero();
    colocarPiezasIniciales();
    inicializarTableroHTML();
    annadirEstiloPiezasIniciales();
    iniciarEventosTablero();
}

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero(){
    tablero = new Array(8);

    for(let i=0, fin=tablero.length; i<fin; i++)
        tablero[i] = new Array(8);
}

function colocarPiezasIniciales(){
    // Casillas en blanco
    for(let i=0; i<8; i++)
        for(let j=0; j<8; j++)
            tablero[i][j] = 0;

    // Piezas blancas
    for(let i=0; i<8; i++)
        tablero[6][i] = 1;    // Peon

    tablero[7][0] = 2;    // Torre
    tablero[7][1] = 3;    // Caballo
    tablero[7][2] = 4;    // Alfil
    tablero[7][3] = 5;    // Reina
    tablero[7][4] = 6;    // Rey
    tablero[7][5] = 4;    // Alfil
    tablero[7][6] = 3;    // Caballo
    tablero[7][7] = 2;    // Torre

    // Piezas negras
    for(let i=0; i<8; i++)
        tablero[1][i] = -1;    // Peon

    tablero[0][0] = -2;    // Torre
    tablero[0][1] = -3;    // Caballo
    tablero[0][2] = -4;    // Alfil
    tablero[0][3] = -5;    // Reina
    tablero[0][4] = -6;    // Rey
    tablero[0][5] = -4;    // Alfil
    tablero[0][6] = -3;    // Caballo
    tablero[0][7] = -2;    // Torre
}

// Asigna a la variable tableroHTML un array de 8x8 con las celdas HTML
function inicializarTableroHTML(){
    var filas, casillasDeLaFila;

    filas = document.querySelectorAll("tr");
    for(let i=0, fin=filas.length; i<fin; i++){
        casillasDeLaFila = filas[i].querySelectorAll("td");
        tableroHTML.push(casillasDeLaFila);
    }
}

function annadirEstiloPiezasIniciales(){
    // Blancas
    for(i=6; i<8; i++)
        for(j=0; j<8; j++)
            annadirEstiloPieza(i, j);

    // Negras
    for(i=0; i<2; i++)
        for(j=0; j<8; j++)
            annadirEstiloPieza(i, j);
}

function annadirEstiloPieza(x, y){
    var piezaHTML = tableroHTML[x][y];
    var tipo = tablero[x][y];

    switch(tipo){
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

function eliminarEstiloPieza(x, y){
    var piezaHTML = tableroHTML[x][y];
    var tipo = tablero[x][y];

    switch(tipo){
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

function iniciarEventosTablero(){
    for(let i=0; i<8; i++)
        for(let j=0; j<8; j++)
            tableroHTML[i][j].addEventListener("click", function(){
                clickEnCasilla(i, j);
            });
}

// Al pulsar una pieza, la selecciono
// Si pulso una casilla a la que no me puedo mover, no pasa nada
// Si pulso una pieza y luego otra, selecciono la segunda
// Si pulso la misma pieza que ya esta seleccionada, la deselecciono
function clickEnCasilla(i, j){
    if(hayPiezaSelec == false){
        if(tablero[i][j] > 0){
            movPosibles = [];
            calcularMovSegunPieza(i, j);
            seleccionarPieza(i, j);
        }
    }
    else
        if(esMovValido(i, j)){
            moverPieza(i, j);
            deseleccionarPieza();
            movPosibles = [];
        }
        else
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if(i != piezaSelec.posX || j != piezaSelec.posY){
                if(tablero[i][j] > 0){
                    movPosibles = [];
                    calcularMovSegunPieza(i, j);
                    seleccionarPieza(i, j);
                }
            }
            // Si la pieza pulsada es la que estaba seleccionada, la deselecciono
            else
                deseleccionarPieza();
}

function seleccionarPieza(i, j){
    hayPiezaSelec = true;
    piezaSelec = {posX: i, posY: j};
}

function deseleccionarPieza(){
    hayPiezaSelec = false;
    piezaSelec = {posX: undefined, posY: undefined};
}

function calcularMovSegunPieza(x, y){
    var tipo = tablero[x][y];

    switch(tipo){
        case 1:
            calcularMovPeonBlanco(x, y);
            break;
    }
}

function calcularMovPeonBlanco(x, y){
    if(x != 0)
        if(tablero[x - 1][y] == 0)
            movPosibles.push(pos = {posX: x - 1, posY: y});
    if(x == 6)
        movPosibles.push(pos = {posX: x - 2, posY: y});
}

function moverPieza(x, y){
    // Si come otra pieza, eliminar estilo de la pieza comida
    if(tablero[x][y] != 0)
        eliminarEstiloPieza(x, y);

    // Pone la pieza y el estilo en la nueva posicion
    tablero[x][y] = tablero[piezaSelec.posX][piezaSelec.posY];
    annadirEstiloPieza(x, y);
    
    // Elimina el estilo y la pieza de la anterior posicion
    eliminarEstiloPieza(piezaSelec.posX, piezaSelec.posY);
    tablero[piezaSelec.posX][piezaSelec.posY] = 0;
}

function esMovValido(x, y){
    return movPosibles.some(pos => pos['posX'] === x && pos['posY'] === y);
}
