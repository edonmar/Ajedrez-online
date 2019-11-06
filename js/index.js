var tablero = [];    // El tablero donde se hacen todas las operaciones
var tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
var hayPiezaSelec = false;
var piezaSelec = {posX: undefined, posY: undefined};
var movPosibles = [];
var turno = true;    // true = blancas, false = negras

window.onload = function(){
    inicializarTablero();
    colocarPiezasIniciales();
    inicializarTableroHTML();
    annadirImgPiezasIniciales();
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

function annadirImgPiezasIniciales(){
    // Blancas
    for(let i=6; i<8; i++)
        for(let j=0; j<8; j++)
            annadirImgPieza(i, j);

    // Negras
    for(let i=0; i<2; i++)
        for(let j=0; j<8; j++)
            annadirImgPieza(i, j);
}

function annadirImgPieza(x, y){
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

function eliminarImgPieza(x, y){
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
        if(turno == true && tablero[i][j] > 0 || turno == false && tablero[i][j] < 0){
            movPosibles = [];
            calcularMovSegunPieza(i, j);
            seleccionarPieza(i, j);
            annadirEstiloMovPosibles();
        }
    }
    else
        if(esMovValido(i, j)){
            moverPieza(i, j);
            eliminarEstiloMovPosibles();
            deseleccionarPieza();
            movPosibles = [];
            turno = !turno;
        }
        else
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if(i != piezaSelec.posX || j != piezaSelec.posY){
                if(turno == true && tablero[i][j] > 0 || turno == false && tablero[i][j] < 0){
                    eliminarEstiloMovPosibles();
                    movPosibles = [];
                    calcularMovSegunPieza(i, j);
                    seleccionarPieza(i, j);
                    annadirEstiloMovPosibles();
                }
            }
            // Si la pieza pulsada es la que estaba seleccionada, la deselecciono
            else{
                eliminarEstiloMovPosibles();
                deseleccionarPieza();
            }
}

function seleccionarPieza(i, j){
    hayPiezaSelec = true;
    piezaSelec = {posX: i, posY: j};
}

function deseleccionarPieza(){
    hayPiezaSelec = false;
    piezaSelec = {posX: undefined, posY: undefined};
}

function annadirEstiloMovPosibles(){
    // Pieza seleccionada
    tableroHTML[piezaSelec.posX][piezaSelec.posY].classList.add("piezaSeleccionada");
    tableroHTML[piezaSelec.posX][piezaSelec.posY].innerHTML = "<div class='piezaSeleccionadaBorde'></div>";

    // Movimientos posibles
    for(let i=0, fin=movPosibles.length; i<fin; i++)
        tableroHTML[movPosibles[i].posX][movPosibles[i].posY].innerHTML = "<div class='movPosible'></div>";
}

function eliminarEstiloMovPosibles(){
    // Pieza seleccionada
    tableroHTML[piezaSelec.posX][piezaSelec.posY].classList.remove("piezaSeleccionada");
    tableroHTML[piezaSelec.posX][piezaSelec.posY].innerHTML = "";

    // Movimientos posibles
    for(let i=0, fin=movPosibles.length; i<fin; i++)
        tableroHTML[movPosibles[i].posX][movPosibles[i].posY].innerHTML = "";
}

function calcularMovSegunPieza(x, y){
    var tipo = tablero[x][y];

    switch(tipo){
        case 1:
            calcularMovPeonBlanco(x, y);
            break;
        case -1:
            calcularMovPeonNegro(x, y);
            break;
    }
}

function calcularMovPeonBlanco(x, y){
    if(x != 0){
        // Una casilla hacia delante
        if(tablero[x - 1][y] == 0)
            movPosibles.push(pos = {posX: x - 1, posY: y});

        // Comer hacia la izquierda
        if(y > 0)
            if(tablero[x - 1][y - 1] < 0)
                movPosibles.push(pos = {posX: x - 1, posY: y - 1});

        // Comer hacia la derecha
        if(y < 7)
            if(tablero[x - 1][y + 1] < 0)
                movPosibles.push(pos = {posX: x - 1, posY: y + 1});
    }

    // Dos casillas hacia delante
    if(x == 6 && tablero[5][y] == 0 && tablero[4][y] == 0)
        movPosibles.push(pos = {posX: 4, posY: y});
}

function calcularMovPeonNegro(x, y){
    if(x != 7){
        // Una casilla hacia delante
        if(tablero[x + 1][y] == 0)
            movPosibles.push(pos = {posX: x + 1, posY: y});

        // Comer hacia la izquierda
        if(y > 0)
            if(tablero[x + 1][y - 1] > 0)
                movPosibles.push(pos = {posX: x + 1, posY: y - 1});

        // Comer hacia la derecha
        if(y < 7)
            if(tablero[x + 1][y + 1] > 0)
                movPosibles.push(pos = {posX: x + 1, posY: y + 1});
    }

    // Dos casillas hacia delante
    if(x == 1 && tablero[2][y] == 0 && tablero[3][y] == 0)
        movPosibles.push(pos = {posX: 3, posY: y});
}

function moverPieza(x, y){
    // Si come otra pieza, eliminar estilo de la pieza comida
    if(tablero[x][y] != 0)
        eliminarImgPieza(x, y);

    // Pone la pieza y el estilo en la nueva posicion
    tablero[x][y] = tablero[piezaSelec.posX][piezaSelec.posY];
    annadirImgPieza(x, y);

    // Elimina el estilo y la pieza de la anterior posicion
    eliminarImgPieza(piezaSelec.posX, piezaSelec.posY);
    tablero[piezaSelec.posX][piezaSelec.posY] = 0;
}

function esMovValido(x, y){
    return movPosibles.some(pos => pos['posX'] === x && pos['posY'] === y);
}
