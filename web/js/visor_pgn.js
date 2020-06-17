class Partida {
    constructor() {
        this.tablero = [];    // El tablero donde se hacen todas las operaciones
        this.tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
        this.hayPiezaSelec = false;
        this.piezaSelec = {x: undefined, y: undefined};
        this.peonAlPaso = {x: undefined, y: undefined};    // Si hay un peon que pueda ser capturado al paso
        this.piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
        this.piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
        this.movPosibles = [];    // Array donde se van a guardar objetos con coordenadas de movimientos posibles
        this.turno = true;    // true = blancas, false = negras
        this.tableroGirado = false;
        this.cadenaMovimientos = "";
        this.resultado = "";
        this.cadenasTableros = [];    // Array de strings con todas las posiciones de cada turno de la repeticion
        this.movAnteriorTableros = [];    // Array de coordenadas con todos los movimientos de la repeticion
        this.jaquesTableros = [];    // Array de booleans con todos los jaques de la repeticion y sus coordenadas
        this.movActualRep = 0;    // El movimiento de la repeticion que estoy viendo en este momento
        this.play = false;    // true = repeticion en play, false = repeticion en pause
        this.intervalo = undefined;
    }
}

window.onload = function () {
    miPartida = new Partida();
    inicializarTablero();
    colocarPiezasIniciales();
    inicializarArraysPiezas();
    inicializarTableroHTML();
    annadirImgPiezasIniciales();
    iniciarEventoBtnGirar();
    iniciarEventoBtnCargarPgn();
};

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero() {
    miPartida.tablero = new Array(8);
    for (let i = 0, finI = miPartida.tablero.length; i < finI; i++)
        miPartida.tablero[i] = new Array(8);
}

function colocarPiezasIniciales() {
    // Casillas en blanco
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            miPartida.tablero[i][j] = "0";

    // Piezas blancas
    miPartida.tablero[7][4] = "R";    // Rey
    miPartida.tablero[7][3] = "D";    // Dama
    miPartida.tablero[7][2] = "A";    // Alfil
    miPartida.tablero[7][5] = "A";    // Alfil
    miPartida.tablero[7][1] = "C";    // Caballo
    miPartida.tablero[7][6] = "C";    // Caballo
    miPartida.tablero[7][0] = "T";    // Torre
    miPartida.tablero[7][7] = "T";    // Torre
    for (let i = 0; i < 8; i++)
        miPartida.tablero[6][i] = "P";    // Peones

    // Piezas negras
    miPartida.tablero[0][4] = "r";    // Rey
    miPartida.tablero[0][3] = "d";    // Dama
    miPartida.tablero[0][1] = "c";    // Caballo
    miPartida.tablero[0][6] = "c";    // Caballo
    miPartida.tablero[0][2] = "a";    // Alfil
    miPartida.tablero[0][5] = "a";    // Alfil
    miPartida.tablero[0][0] = "t";    // Torre
    miPartida.tablero[0][7] = "t";    // Torre
    for (let i = 0; i < 8; i++)
        miPartida.tablero[1][i] = "p";    // Peones
}

function inicializarArraysPiezas() {
    // Blancas
    miPartida.piezasBlancas.push({x: 7, y: 4});    // Rey
    miPartida.piezasBlancas.push({x: 7, y: 3});    // Dama
    miPartida.piezasBlancas.push({x: 7, y: 2});    // Alfil
    miPartida.piezasBlancas.push({x: 7, y: 5});    // Alfil
    miPartida.piezasBlancas.push({x: 7, y: 1});    // Caballo
    miPartida.piezasBlancas.push({x: 7, y: 6});    // Caballo
    miPartida.piezasBlancas.push({x: 7, y: 0});    // Torre
    miPartida.piezasBlancas.push({x: 7, y: 7});    // Torre
    for (let i = 0; i < 8; i++)
        miPartida.piezasBlancas.push({x: 6, y: i});    // Peones

    // Negras
    miPartida.piezasNegras.push({x: 0, y: 4});    // Rey
    miPartida.piezasNegras.push({x: 0, y: 3});    // Dama
    miPartida.piezasNegras.push({x: 0, y: 2});    // Alfil
    miPartida.piezasNegras.push({x: 0, y: 5});    // Alfil
    miPartida.piezasNegras.push({x: 0, y: 1});    // Caballo
    miPartida.piezasNegras.push({x: 0, y: 6});    // Caballo
    miPartida.piezasNegras.push({x: 0, y: 0});    // Torre
    miPartida.piezasNegras.push({x: 0, y: 7});    // Torre
    for (let i = 0; i < 8; i++)
        miPartida.piezasNegras.push({x: 1, y: i});    // Peones
}

// Asigna a la variable tableroHTML un array de 8x8 con las celdas HTML
function inicializarTableroHTML() {
    let filas, casillasDeLaFila;

    filas = document.querySelectorAll("tr");
    for (let i = 0, finI = filas.length; i < finI; i++) {
        casillasDeLaFila = filas[i].querySelectorAll("td");
        miPartida.tableroHTML.push(casillasDeLaFila);
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
    let tipo = miPartida.tablero[x][y];
    if (miPartida.tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let piezaHTML = miPartida.tableroHTML[x][y];

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
    let tipo = miPartida.tablero[x][y];
    if (miPartida.tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let piezaHTML = miPartida.tableroHTML[x][y];

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

function eliminarEstiloMovAnterior() {
    let casillasMovAnterior = document.querySelectorAll(".casillasMovAnterior");

    for (let i = 0, finI = casillasMovAnterior.length; i < finI; i++)
        casillasMovAnterior[i].classList.remove("casillasMovAnterior");
}

function eliminarEstiloJaque() {
    let piezasColor;

    if (miPartida.turno)
        piezasColor = miPartida.piezasBlancas;
    else
        piezasColor = miPartida.piezasNegras;

    let x = piezasColor[0].x;
    let y = piezasColor[0].y;
    if (miPartida.tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }
    let casillaHTML = miPartida.tableroHTML[x][y];

    casillaHTML.classList.remove("reyAmenazado");
    casillaHTML.innerHTML = "";
}

function iniciarEventoBtnGirar() {
    let btnGirar = document.getElementById("btnGirar");
    btnGirar.onclick = function () {
        girar();
    }
}

function iniciarEventoBtnCargarPgn() {
    let btnCargarPgn = document.getElementById("btnCargarPgn");
    btnCargarPgn.onclick = function () {
        try {
            verRepeticion(document.getElementById("textAreaPgn").value);
        } catch {
            modalErrorCargaPgn();
        }
    }
}

function esBlanca(valor) {
    return valor === valor.toUpperCase() && valor !== valor.toLowerCase();
}

function esNegra(valor) {
    return valor === valor.toLowerCase() && valor !== valor.toUpperCase();
}

function seleccionarPieza(x, y) {
    miPartida.hayPiezaSelec = true;
    miPartida.piezaSelec = {x: x, y: y};
}

function moverPieza(x, y) {
    let come = false;

    // Si come otra pieza, eliminar estilo de la pieza comida
    if (miPartida.tablero[x][y] !== "0") {
        eliminarImgPieza(x, y);
        come = true;
    }

    // Pone la pieza y el estilo en la nueva posicion
    miPartida.tablero[x][y] = miPartida.tablero[miPartida.piezaSelec.x][miPartida.piezaSelec.y];
    annadirImgPieza(x, y);

    // Elimina el estilo y la pieza de la anterior posicion
    eliminarImgPieza(miPartida.piezaSelec.x, miPartida.piezaSelec.y);
    miPartida.tablero[miPartida.piezaSelec.x][miPartida.piezaSelec.y] = "0";

    if (miPartida.turno) {
        cambiarObjetoPiezaMovida(miPartida.piezasBlancas, x, y);
        if (come)
            eliminarObjetoPiezaComida(miPartida.piezasNegras, x, y);
    } else {
        cambiarObjetoPiezaMovida(miPartida.piezasNegras, x, y);
        if (come)
            eliminarObjetoPiezaComida(miPartida.piezasBlancas, x, y);
    }
}

// Cambia las coordenadas de la pieza en el array de objetos
function cambiarObjetoPiezaMovida(piezasColor, x, y) {
    piezasColor.find((pos, i) => {
        if (pos.x === miPartida.piezaSelec.x && pos.y === miPartida.piezaSelec.y) {
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
    let movPosiblesAux = miPartida.movPosibles;
    let piezasAmenazantes;
    let reyAmenazado;
    let jaque = false;

    if (colorAmenazante) {
        piezasAmenazantes = miPartida.piezasBlancas;
        reyAmenazado = "r";
    } else {
        piezasAmenazantes = miPartida.piezasNegras;
        reyAmenazado = "R";
    }

    let numPiezasAmenazantes = piezasAmenazantes.length;
    let i = 0;
    do {
        miPartida.movPosibles = [];
        calcularMovSegunPieza(piezasAmenazantes[i].x, piezasAmenazantes[i].y);
        for (let i = 0, finI = miPartida.movPosibles.length; i < finI; i++)
            if (miPartida.tablero[miPartida.movPosibles[i].x][miPartida.movPosibles[i].y] === reyAmenazado) {
                jaque = true;
                break;
            }
        i++;
    } while (i < numPiezasAmenazantes && !jaque);

    miPartida.movPosibles = movPosiblesAux;

    return jaque;
}

// Llamando a la funcion esJaque, compruebo si al hacer un movimiento el rey del color movido quedaria en jaque
function movAmenazaReyPropio(i, colorAmenazante, casillaOrigen, valorCasillaOrigen) {
    let jaque = false;
    let comeNormal = false;
    let comeAlPaso = false;
    let colorComida;
    let posComida;
    let casillaDestinoX = miPartida.movPosibles[i].x;
    let casillaDestinoY = miPartida.movPosibles[i].y;
    let valorCasillaDestino = miPartida.tablero[casillaDestinoX][casillaDestinoY];

    // Compruebo si ha comido de manera normal
    if (esNegra(valorCasillaOrigen) && esBlanca(valorCasillaDestino)) {
        colorComida = miPartida.piezasBlancas;
        comeNormal = true;
    } else if (esBlanca(valorCasillaOrigen) && esNegra(valorCasillaDestino)) {
        colorComida = miPartida.piezasNegras;
        comeNormal = true;
    } else if (valorCasillaOrigen.toUpperCase() === "P") {
        if (casillaOrigen.x === miPartida.peonAlPaso.x && casillaDestinoY === miPartida.peonAlPaso.y) {    // Si ha comido al paso
            if (casillaDestinoX === miPartida.peonAlPaso.x - 1) {
                colorComida = miPartida.piezasNegras;
                comeAlPaso = true;
            } else if (casillaDestinoX === miPartida.peonAlPaso.x + 1) {
                colorComida = miPartida.piezasBlancas;
                comeAlPaso = true;
            }
        }
    }

    // Si el movimiento come una pieza, simulo eliminar la pieza comida de su array
    if (comeNormal)
        posComida = eliminarObjetoPiezaComida(colorComida, casillaDestinoX, casillaDestinoY);
    else if (comeAlPaso)
        posComida = eliminarObjetoPiezaComida(colorComida, miPartida.peonAlPaso.x, miPartida.peonAlPaso.y);

    // Simulo mover una pieza para ver como quedaria el miPartida.tablero si hiciera ese movimiento
    miPartida.tablero[casillaOrigen.x][casillaOrigen.y] = "0";
    miPartida.tablero[casillaDestinoX][casillaDestinoY] = valorCasillaOrigen;
    if (comeAlPaso)
        miPartida.tablero[miPartida.peonAlPaso.x][miPartida.peonAlPaso.y] = "0";

    // Realizo la comprobacion
    if (esJaque(colorAmenazante))
        jaque = true;

    // Vuelvo a colocar las piezas donde estaban antes de simular el movimiento
    miPartida.tablero[casillaOrigen.x][casillaOrigen.y] = valorCasillaOrigen;
    miPartida.tablero[casillaDestinoX][casillaDestinoY] = valorCasillaDestino;
    if (comeAlPaso) {
        if (colorComida === miPartida.piezasBlancas)
            miPartida.tablero[miPartida.peonAlPaso.x][miPartida.peonAlPaso.y] = "P";
        if (colorComida === miPartida.piezasNegras)
            miPartida.tablero[miPartida.peonAlPaso.x][miPartida.peonAlPaso.y] = "p";
    }

    // Vuelvo a colocar la pieza comida (si la hay) en su array, en la posicion donde estaba
    if (comeNormal)
        colorComida.splice(posComida, 0, {x: casillaDestinoX, y: casillaDestinoY});
    else if (comeAlPaso)
        colorComida.splice(posComida, 0, {x: miPartida.peonAlPaso.x, y: miPartida.peonAlPaso.y});

    return jaque;
}

// Si le paso true, resetea el tablero y lo prepara para ver la repeticion
// Si le paso false, resetea el tablero y lo prepara para jugar de nuevo
function reiniciarPartida(repeticion) {
    // Elimino todas las imagenes y estilos del tablero
    eliminarEstiloJaque();
    eliminarEstiloMovAnterior();
    for (let i = 0, finI = miPartida.piezasBlancas.length; i < finI; i++)
        eliminarImgPieza(miPartida.piezasBlancas[i].x, miPartida.piezasBlancas[i].y);
    for (let i = 0, finI = miPartida.piezasNegras.length; i < finI; i++)
        eliminarImgPieza(miPartida.piezasNegras[i].x, miPartida.piezasNegras[i].y);
    if (!repeticion)
        document.getElementById("tablaMov").innerHTML = "";

    if (miPartida.tableroGirado) {
        girarSpans(document.querySelectorAll("#numeros span"));
        girarSpans(document.querySelectorAll("#letras span"));
    }

    // Vuelvo a poner las variables globales en su valor inicial
    miPartida.hayPiezaSelec = false;
    miPartida.piezaSelec = {x: undefined, y: undefined};
    miPartida.peonAlPaso = {x: undefined, y: undefined};
    miPartida.piezasBlancas = [];
    miPartida.piezasNegras = [];
    miPartida.movPosibles = [];
    movidaEnroqueCortoBlanco = false;
    movidaEnroqueLargoBlanco = false;
    movidaEnroqueCortoNegro = false;
    movidaEnroqueLargoNegro = false;
    regla50MovBlancas = 0;
    regla50MovNegras = 0;
    regla3RepMovimientos = [];
    regla3RepTurnos = [];
    miPartida.turno = true;
    miPartida.tableroGirado = false;
    if (!repeticion) {
        miPartida.cadenaMovimientos = "";
        miPartida.resultado = "";
    }
    miPartida.cadenasTableros = [];
    miPartida.movAnteriorTableros = [];
    miPartida.jaquesTableros = [];
    miPartida.movActualRep = 0;
    if (miPartida.play)
        pararIntervalo();

    // Coloco el tablero, piezas e imagenes e inicio la partida
    colocarPiezasIniciales();
    inicializarArraysPiezas();
    annadirImgPiezasIniciales();
}

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
    miPartida.tableroGirado = !miPartida.tableroGirado;
}

function girarTablero() {
    let casillaA;
    let casillaB;
    let htmlAux;
    let classAux;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            casillaA = miPartida.tableroHTML[i][j];
            htmlAux = casillaA.innerHTML;
            classAux = casillaA.className;
            casillaB = miPartida.tableroHTML[7 - i][7 - j];

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

// Relleno la tabla de movimientos con la cadena
// Sin mostrar nada, realizo todos los movimientos, guardando la posicion del tablero en cada turno
// Al darle clic a un movimiento de la tabla, muestra el tablero que he guardado para ese turno
function verRepeticion(cadena) {
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
    miPartida.movAnteriorTableros.push({
        origenX: undefined,
        origenY: undefined,
        destinoX: undefined,
        destinoY: undefined
    });
    miPartida.jaquesTableros.push({esJaque: false, x: undefined, y: undefined});
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

function modalErrorCargaPgn() {
    let modal = document.getElementById("miModal");
    let cerrar = document.getElementById("modalCerrar");
    let titulo = document.getElementById("modalTitulo");
    let body = document.getElementById("modalBody");

    body.innerHTML = "";
    titulo.innerHTML = "Error";

    let p = document.createElement("P");
    p.innerHTML = "El texto PGN introducido no es v&aacute;lido";

    body.appendChild(p);

    // Boton de cerrar el modal
    cerrar.onclick = function () {
        modal.style.display = "none";
        titulo.innerHTML = "";
        body.innerHTML = "";
    }

    // Mostrar el modal
    modal.style.display = "block";
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
            if (miPartida.play) {
                clearInterval(miPartida.intervalo);
                if (miPartida.movActualRep + 1 !== movs.length)    // Si el miPartida.intervalo esta activo, el contador vuelve a 0ms
                    miPartida.intervalo = setInterval(avanzarAutomaticamente, 1000);
                else {
                    document.getElementById("btnPlayPause").innerHTML = svgPlay;
                    miPartida.play = false;
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
        if (miPartida.movActualRep >= 0) {
            estilosMovActualRep(miPartida.movActualRep - 1);
            cargarTablero(miPartida.movActualRep + 1);
        }
    }

    document.getElementById("btnPlayPause").onclick = function () {
        if (!miPartida.play) {
            pasoAdelante();
            miPartida.intervalo = setInterval(avanzarAutomaticamente, 1000);
            document.getElementById("btnPlayPause").innerHTML = svgPause;
            miPartida.play = true;
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
        cargarTablero(miPartida.movActualRep + 1);
    }

    function avanzarAutomaticamente() {
        pasoAdelante();
        if (miPartida.movActualRep + 2 === miPartida.cadenasTableros.length)
            pararIntervalo();
    }

    function pasoAdelante() {
        if (miPartida.movActualRep + 1 !== movs.length) {
            estilosMovActualRep(miPartida.movActualRep + 1);
            cargarTablero(miPartida.movActualRep + 1);
        }
    }
}

function pararIntervalo() {
    let svgPlay = '<svg x="0px" y="0px" viewBox="0 0 47.604 47.604">\n' +
        '<path d="M43.331,21.237L7.233,0.397c-0.917-0.529-2.044-0.529-2.96,0c-0.916,0.528-1.48,\n' +
        '1.505-1.48,2.563v41.684c0,1.058,0.564,2.035,1.48,2.563c0.458,0.268,0.969,0.397,1.48,0.397c0.511,\n' +
        '0,1.022-0.133,1.48-0.397l36.098-20.84c0.918-0.529,1.479-1.506,1.479-2.564S44.247,21.767,\n' +
        '43.331,21.237z"/></svg>';

    clearInterval(miPartida.intervalo);
    document.getElementById("btnPlayPause").innerHTML = svgPlay;
    miPartida.play = false;
}

// Colorea el movimiento actual en la tabla, y elimina el coloreado del seleccionado anteriormente
function estilosMovActualRep(n) {
    let spans = document.querySelectorAll(".spanMovRepeticion");

    if (miPartida.movActualRep !== -1)
        spans[miPartida.movActualRep].classList.remove("movActualRep");

    miPartida.movActualRep = n;

    if (miPartida.movActualRep !== -1)
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
            miPartida.turno = (i + 2) % 3 === 0;
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
            miPartida.resultado = "1-0";
        else
            miPartida.resultado = "0-1";
    } else
        miPartida.resultado = "1/2-1/2";

    span = document.createElement("span");
    span.innerHTML = miPartida.resultado;

    fila.appendChild(span);
    tablaMov.appendChild(fila);
}

function guardarTablero() {
    let cadena = "";

    // Creo una cadena con el valor de todas las casillas del tablero
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            cadena += miPartida.tablero[i][j];

    miPartida.cadenasTableros.push(cadena);
}

function cargarTablero(n) {
    let pos = 0;
    let coor = {x: undefined, y: undefined};

    // Rellena el tablero con el valor de la cadena guardada
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Elimino estilos
            miPartida.tableroHTML[i][j].classList.remove("casillasMovAnterior");
            if (miPartida.tableroHTML[i][j].classList.contains("reyAmenazado")) {
                miPartida.tableroHTML[i][j].classList.remove("reyAmenazado");
                miPartida.tableroHTML[i][j].innerHTML = "";
            }
            // Cambio de pieza
            if (miPartida.tablero[i][j] !== miPartida.cadenasTableros[n][pos]) {
                eliminarImgPieza(i, j);
                miPartida.tablero[i][j] = miPartida.cadenasTableros[n][pos];
                annadirImgPieza(i, j);
            }
            pos++;
        }
    }

    if (n !== 0) {
        // Annade los estilos del movimiento anterior
        coor.x = miPartida.movAnteriorTableros[n].origenX;
        coor.y = miPartida.movAnteriorTableros[n].origenY;
        if (miPartida.tableroGirado) girarCoorEstilo();
        miPartida.tableroHTML[coor.x][coor.y].classList.add("casillasMovAnterior");

        coor.x = miPartida.movAnteriorTableros[n].destinoX;
        coor.y = miPartida.movAnteriorTableros[n].destinoY;
        if (miPartida.tableroGirado) girarCoorEstilo();
        miPartida.tableroHTML[coor.x][coor.y].classList.add("casillasMovAnterior");

        // Annade el estilo del jaque
        if (miPartida.jaquesTableros[n].esJaque === true) {
            coor.x = miPartida.jaquesTableros[n].x;
            coor.y = miPartida.jaquesTableros[n].y;
            if (miPartida.tableroGirado) girarCoorEstilo();
            miPartida.tableroHTML[coor.x][coor.y].classList.add("reyAmenazado");
            miPartida.tableroHTML[coor.x][coor.y].innerHTML = "<div class='piezaResaltadaBorde'></div>";
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
            if (miPartida.turno) {
                if (miPartida.tablero[destino.x + 1][destino.y] === "P")
                    origen.x = destino.x + 1;
                else if (miPartida.tablero[destino.x + 2][destino.y] === "P")
                    origen.x = destino.x + 2;
            } else {
                if (miPartida.tablero[destino.x - 1][destino.y] === "p")
                    origen.x = destino.x - 1;
                else if (miPartida.tablero[destino.x - 2][destino.y] === "p")
                    origen.x = destino.x - 2;
            }

        } else if (captura) {    // Peon captura
            destino.x = numeroAPosicion(subString[2]);
            destino.y = letraAPosicion(subString[1]);
            if (miPartida.turno)
                origen.x = destino.x + 1;
            else
                origen.x = destino.x - 1;

            if (miPartida.tablero[destino.x][destino.y] === "0") {    // Peon captura al paso
                if (miPartida.turno) {
                    eliminarImgPieza(destino.x + 1, destino.y);
                    miPartida.tablero[destino.x + 1][destino.y] = "0";
                    eliminarObjetoPiezaComida(miPartida.piezasNegras, destino.x + 1, destino.y);
                } else {
                    eliminarImgPieza(destino.x - 1, destino.y);
                    miPartida.tablero[destino.x - 1][destino.y] = "0";
                    eliminarObjetoPiezaComida(miPartida.piezasBlancas, destino.x - 1, destino.y);
                }
            }
        }

        if (notacion.indexOf("=") !== -1) {    // Promocion del peon
            let nuevaPieza = subString[subString.indexOf("=") + 1];
            if (miPartida.turno)
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
            miPartida.tablero[origen.x][origen.y] = nuevaPieza;
        }

    } else if (subString[0] === "O") {    // Enroque
        let x;
        let posYOrigenTorre;
        let posYDestinoTorre;

        if (miPartida.turno)
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
            if (miPartida.turno) {    // Rey blanco
                origen.x = miPartida.piezasBlancas[0].x;
                origen.y = miPartida.piezasBlancas[0].y;
            } else {    // Rey negro
                origen.x = miPartida.piezasNegras[0].x;
                origen.y = miPartida.piezasNegras[0].y;
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
    miPartida.movAnteriorTableros.push({
        origenX: origen.x,
        origenY: origen.y,
        destinoX: destino.x,
        destinoY: destino.y
    });

    if (jaque) {
        let posJaqueX;
        let posJaqueY;

        if (miPartida.turno) {
            posJaqueX = miPartida.piezasNegras[0].x;
            posJaqueY = miPartida.piezasNegras[0].y;
        } else {
            posJaqueX = miPartida.piezasBlancas[0].x;
            posJaqueY = miPartida.piezasBlancas[0].y;
        }
        miPartida.jaquesTableros.push({esJaque: true, x: posJaqueX, y: posJaqueY});
    } else
        miPartida.jaquesTableros.push({esJaque: false, x: undefined, y: undefined});

    // Realizo el movimiento
    seleccionarPieza(origen.x, origen.y);
    moverPieza(destino.x, destino.y);
}

function descifrarAmbiguedad(destino, tipoPieza, ambiguedad) {
    let piezasAmbiguedad = [];
    let piezasColor;
    let esMismoTipo;
    let origen = {x: undefined, y: undefined};

    if (miPartida.turno)
        piezasColor = miPartida.piezasBlancas;
    else {
        piezasColor = miPartida.piezasNegras;
        tipoPieza = tipoPieza.toLowerCase();
    }

    // Si no hay ambiguedad, guardo en un array todas las piezas del mismo tipo que tipoPieza
    // Si hay ambiguedad, solo guardo las piezas del mismo tipo que tipoPieza que esten en esa letra / numero
    for (let i = 0, finI = piezasColor.length; i < finI; i++) {
        esMismoTipo = false;
        if (miPartida.tablero[piezasColor[i].x][piezasColor[i].y] === tipoPieza) {
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
            miPartida.movPosibles = [];
            calcularMovSegunPieza(piezasAmbiguedad[i].x, piezasAmbiguedad[i].y);
            for (let j = 0, finJ = miPartida.movPosibles.length; j < finJ; j++) {
                if (destino.x === miPartida.movPosibles[j].x && destino.y === miPartida.movPosibles[j].y)
                    if (!movAmenazaReyPropio(j, !miPartida.turno, piezasAmbiguedad[i], tipoPieza)) {
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

function numeroAPosicion(x) {
    return (8 - x);
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
    let tipo = miPartida.tablero[x][y];

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
        if (miPartida.tablero[x - 1][y] === "0")
            miPartida.movPosibles.push({x: x - 1, y: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esNegra(miPartida.tablero[x - 1][y - 1]))
                miPartida.movPosibles.push({x: x - 1, y: y - 1});
            // Comer al paso
            if (x === 3 && miPartida.peonAlPaso.x === 3 && miPartida.peonAlPaso.y === y - 1)
                miPartida.movPosibles.push({x: x - 1, y: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esNegra(miPartida.tablero[x - 1][y + 1]))
                miPartida.movPosibles.push({x: x - 1, y: y + 1});
            // Comer al paso
            if (x === 3 && miPartida.peonAlPaso.x === 3 && miPartida.peonAlPaso.y === y + 1)
                miPartida.movPosibles.push({x: x - 1, y: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 6 && miPartida.tablero[5][y] === "0" && miPartida.tablero[4][y] === "0")
        miPartida.movPosibles.push({x: 4, y: y});
}

function calcularMovPeonNegro(x, y) {
    if (x !== 7) {
        // Una casilla hacia delante
        if (miPartida.tablero[x + 1][y] === "0")
            miPartida.movPosibles.push({x: x + 1, y: y});

        // Comer hacia la izquierda
        if (y > 0) {
            // Comer normal
            if (esBlanca(miPartida.tablero[x + 1][y - 1]))
                miPartida.movPosibles.push({x: x + 1, y: y - 1});
            // Comer al paso
            if (x === 4 && miPartida.peonAlPaso.x === 4 && miPartida.peonAlPaso.y === y - 1)
                miPartida.movPosibles.push({x: x + 1, y: y - 1});
        }

        // Comer hacia la derecha
        if (y < 7) {
            // Comer normal
            if (esBlanca(miPartida.tablero[x + 1][y + 1]))
                miPartida.movPosibles.push({x: x + 1, y: y + 1});
            // Comer al paso
            if (x === 4 && miPartida.peonAlPaso.x === 4 && miPartida.peonAlPaso.y === y + 1)
                miPartida.movPosibles.push({x: x + 1, y: y + 1});
        }
    }

    // Dos casillas hacia delante
    if (x === 1 && miPartida.tablero[2][y] === "0" && miPartida.tablero[3][y] === "0")
        miPartida.movPosibles.push({x: 3, y: y});
}

function calcularMovTorreBlanco(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (esBlanca(miPartida.tablero[x - i][y]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y});
        if (esNegra(miPartida.tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esBlanca(miPartida.tablero[x][y + i]))
            break;
        miPartida.movPosibles.push({x: x, y: y + i});
        if (esNegra(miPartida.tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esBlanca(miPartida.tablero[x + i][y]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y});
        if (esNegra(miPartida.tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esBlanca(miPartida.tablero[x][y - i]))
            break;
        miPartida.movPosibles.push({x: x, y: y - i});
        if (esNegra(miPartida.tablero[x][y - i]))
            break;
        i++;
    }
}

function calcularMovTorreNegro(x, y) {
    let i;

    // Arriba
    i = 1;
    while (x - i >= 0) {
        if (esNegra(miPartida.tablero[x - i][y]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y});
        if (esBlanca(miPartida.tablero[x - i][y]))
            break;
        i++;
    }

    // Derecha
    i = 1;
    while (y + i <= 7) {
        if (esNegra(miPartida.tablero[x][y + i]))
            break;
        miPartida.movPosibles.push({x: x, y: y + i});
        if (esBlanca(miPartida.tablero[x][y + i]))
            break;
        i++;
    }

    // Abajo
    i = 1;
    while (x + i <= 7) {
        if (esNegra(miPartida.tablero[x + i][y]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y});
        if (esBlanca(miPartida.tablero[x + i][y]))
            break;
        i++;
    }

    // Izquierda
    i = 1;
    while (y - i >= 0) {
        if (esNegra(miPartida.tablero[x][y - i]))
            break;
        miPartida.movPosibles.push({x: x, y: y - i});
        if (esBlanca(miPartida.tablero[x][y - i]))
            break;
        i++;
    }
}

function calcularMovCaballoBlanco(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esBlanca(miPartida.tablero[x - 1][y - 2]))
            miPartida.movPosibles.push({x: x - 1, y: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esBlanca(miPartida.tablero[x - 2][y - 1]))
            miPartida.movPosibles.push({x: x - 2, y: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esBlanca(miPartida.tablero[x - 1][y + 2]))
            miPartida.movPosibles.push({x: x - 1, y: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x - 2][y + 1]))
            miPartida.movPosibles.push({x: x - 2, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esBlanca(miPartida.tablero[x + 1][y + 2]))
            miPartida.movPosibles.push({x: x + 1, y: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x + 2][y + 1]))
            miPartida.movPosibles.push({x: x + 2, y: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esBlanca(miPartida.tablero[x + 1][y - 2]))
            miPartida.movPosibles.push({x: x + 1, y: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esBlanca(miPartida.tablero[x + 2][y - 1]))
            miPartida.movPosibles.push({x: x + 2, y: y - 1});
}

function calcularMovCaballoNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 2 >= 0)
        if (!esNegra(miPartida.tablero[x - 1][y - 2]))
            miPartida.movPosibles.push({x: x - 1, y: y - 2});
    if (x - 2 >= 0 && y - 1 >= 0)
        if (!esNegra(miPartida.tablero[x - 2][y - 1]))
            miPartida.movPosibles.push({x: x - 2, y: y - 1});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 2 <= 7)
        if (!esNegra(miPartida.tablero[x - 1][y + 2]))
            miPartida.movPosibles.push({x: x - 1, y: y + 2});
    if (x - 2 >= 0 && y + 1 <= 7)
        if (!esNegra(miPartida.tablero[x - 2][y + 1]))
            miPartida.movPosibles.push({x: x - 2, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 2 <= 7)
        if (!esNegra(miPartida.tablero[x + 1][y + 2]))
            miPartida.movPosibles.push({x: x + 1, y: y + 2});
    if (x + 2 <= 7 && y + 1 <= 7)
        if (!esNegra(miPartida.tablero[x + 2][y + 1]))
            miPartida.movPosibles.push({x: x + 2, y: y + 1});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 2 >= 0)
        if (!esNegra(miPartida.tablero[x + 1][y - 2]))
            miPartida.movPosibles.push({x: x + 1, y: y - 2});
    if (x + 2 <= 7 && y - 1 >= 0)
        if (!esNegra(miPartida.tablero[x + 2][y - 1]))
            miPartida.movPosibles.push({x: x + 2, y: y - 1});
}

function calcularMovAlfilBlanco(x, y) {
    let i, j;

    // Arriba - Izquierda
    i = 1;
    j = 1;
    while (x - i >= 0 && y - j >= 0) {
        if (esBlanca(miPartida.tablero[x - i][y - j]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y - j});
        if (esNegra(miPartida.tablero[x - i][y - j]))
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (esBlanca(miPartida.tablero[x - i][y + j]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y + j});
        if (esNegra(miPartida.tablero[x - i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (esBlanca(miPartida.tablero[x + i][y + j]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y + j});
        if (esNegra(miPartida.tablero[x + i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (esBlanca(miPartida.tablero[x + i][y - j]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y - j});
        if (esNegra(miPartida.tablero[x + i][y - j]))
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
        if (esNegra(miPartida.tablero[x - i][y - j]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y - j});
        if (esBlanca(miPartida.tablero[x - i][y - j]))
            break;
        i++;
        j++;
    }

    // Arriba - Derecha
    i = 1;
    j = 1;
    while (x - i >= 0 && y + j <= 7) {
        if (esNegra(miPartida.tablero[x - i][y + j]))
            break;
        miPartida.movPosibles.push({x: x - i, y: y + j});
        if (esBlanca(miPartida.tablero[x - i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Derecha
    i = 1;
    j = 1;
    while (x + i <= 7 && y + j <= 7) {
        if (esNegra(miPartida.tablero[x + i][y + j]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y + j});
        if (esBlanca(miPartida.tablero[x + i][y + j]))
            break;
        i++;
        j++;
    }

    // Abajo - Izquierda
    i = 1;
    j = 1;
    while (x + i <= 7 && y - j >= 0) {
        if (esNegra(miPartida.tablero[x + i][y - j]))
            break;
        miPartida.movPosibles.push({x: x + i, y: y - j});
        if (esBlanca(miPartida.tablero[x + i][y - j]))
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
        if (!esBlanca(miPartida.tablero[x - 1][y - 1]))
            miPartida.movPosibles.push({x: x - 1, y: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esBlanca(miPartida.tablero[x - 1][y]))
            miPartida.movPosibles.push({x: x - 1, y: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x - 1][y + 1]))
            miPartida.movPosibles.push({x: x - 1, y: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x][y + 1]))
            miPartida.movPosibles.push({x: x, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x + 1][y + 1]))
            miPartida.movPosibles.push({x: x + 1, y: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esBlanca(miPartida.tablero[x + 1][y]))
            miPartida.movPosibles.push({x: x + 1, y: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esBlanca(miPartida.tablero[x + 1][y - 1]))
            miPartida.movPosibles.push({x: x + 1, y: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esBlanca(miPartida.tablero[x][y - 1]))
            miPartida.movPosibles.push({x: x, y: y - 1});
}

function calcularMovReyNegro(x, y) {
    // Arriba - Izquierda
    if (x - 1 >= 0 && y - 1 >= 0)
        if (!esNegra(miPartida.tablero[x - 1][y - 1]))
            miPartida.movPosibles.push({x: x - 1, y: y - 1});

    // Arriba
    if (x - 1 >= 0)
        if (!esNegra(miPartida.tablero[x - 1][y]))
            miPartida.movPosibles.push({x: x - 1, y: y});

    // Arriba - Derecha
    if (x - 1 >= 0 && y + 1 <= 7)
        if (!esNegra(miPartida.tablero[x - 1][y + 1]))
            miPartida.movPosibles.push({x: x - 1, y: y + 1});

    // Derecha
    if (y + 1 <= 7)
        if (!esNegra(miPartida.tablero[x][y + 1]))
            miPartida.movPosibles.push({x: x, y: y + 1});

    // Abajo - Derecha
    if (x + 1 <= 7 && y + 1 <= 7)
        if (!esNegra(miPartida.tablero[x + 1][y + 1]))
            miPartida.movPosibles.push({x: x + 1, y: y + 1});

    // Abajo
    if (x + 1 <= 7)
        if (!esNegra(miPartida.tablero[x + 1][y]))
            miPartida.movPosibles.push({x: x + 1, y: y});

    // Abajo - Izquierda
    if (x + 1 <= 7 && y - 1 >= 0)
        if (!esNegra(miPartida.tablero[x + 1][y - 1]))
            miPartida.movPosibles.push({x: x + 1, y: y - 1});

    // Izquierda
    if (y - 1 >= 0)
        if (!esNegra(miPartida.tablero[x][y - 1]))
            miPartida.movPosibles.push({x: x, y: y - 1});
}
