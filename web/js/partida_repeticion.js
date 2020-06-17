class Partida {
    constructor() {
        this.tablero = [];    // El tablero donde se hacen todas las operaciones
        this.tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
        this.tableroGirado = false;
        this.cadenasTableros = [];    // Array de strings con todas las posiciones de cada turno de la repeticion
        this.movAnteriorTableros = [];    // Array de coordenadas con todos los movimientos de la repeticion
        this.jaquesTableros = [];    // Array de booleans con todos los jaques de la repeticion y sus coordenadas
        this.movActualRep = 0;    // El movimiento de la repeticion que estoy viendo en este momento
        this.play = false;    // true = repeticion en play, false = repeticion en pause
        this.intervalo = undefined;
        this.idPartida = undefined;
    }
}

window.onload = function () {
    miPartida = new Partida();
    obtenerDatosPlantilla();
    inicializarTablero();
    inicializarTableroHTML();
    iniciarEventoBtnGirar();
    cargarTableros();
};

// Asigna a la variable Tablero un array 8x8 vacio
function inicializarTablero() {
    miPartida.tablero = new Array(8);
    for (let i = 0, finI = miPartida.tablero.length; i < finI; i++)
        miPartida.tablero[i] = new Array(8);
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

function annadirImgPieza(x, y) {
    let tipo = miPartida.tablero[x][y];

    if (tipo === undefined)
        return;

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

    if (tipo === undefined)
        return;

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

function cargarTableros() {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);
            rellenarArrays(respuesta.tableros);
            verRepeticion(respuesta.pgn);
            escribirResultado(respuesta.resultado);
        }
    };

    xhr.open("GET", "/cargar_tableros?partida=" + miPartida.idPartida, true);
    xhr.send();
}

function rellenarArrays(tableros) {
    for (let i = 0, finI = tableros.length; i < finI; i++) {
        rellenarArrayCasillas(tableros[i].casillas);
        rellenarArrayJaque(tableros[i].jaque, tableros[i].casillas, tableros[i].turno);
        rellenarArrayUltimoMov(tableros[i].ultimoMov);
    }
}

function rellenarArrayCasillas(casillas) {
    miPartida.cadenasTableros.push(casillas);
}

function rellenarArrayJaque(jaque, casillas, turno) {
    let esJaque = jaque;
    let x = undefined;
    let y = undefined;

    if (esJaque) {
        let reyJaque;

        if (turno)
            reyJaque = "R";
        else
            reyJaque = "r";

        let n = casillas.indexOf(reyJaque);
        x = 0;

        while (n > 8) {
            n = n - 8;
            x++;
        }
        y = n;
    }

    miPartida.jaquesTableros.push({
        esJaque: esJaque,
        x: x,
        y: y
    });
}

function rellenarArrayUltimoMov(ultimoMov) {
    miPartida.movAnteriorTableros.push({
        origenX: parseInt(ultimoMov[0]),
        origenY: parseInt(ultimoMov[1]),
        destinoX: parseInt(ultimoMov[2]),
        destinoY: parseInt(ultimoMov[3])
    });
}

// Relleno la tabla de movimientos con la cadena
// Al darle clic a un movimiento de la tabla, muestra el tablero que he guardado para ese turno
function verRepeticion(cadena) {
    cargarCadenaMovimientos(cadena);
    // Muestro el primer movimiento de la partida
    crearEventosMovRepeticion();
    cargarTablero(1);
    estilosMovActualRep(0);
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
                if (miPartida.movActualRep + 1 !== movs.length)    // Si el intervalo esta activo, el contador vuelve a 0ms
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
        }
    }
}

function escribirResultado(resultado) {
    let tablaMov = document.getElementById("tablaMov");

    let nuevaFila = document.createElement("div");
    nuevaFila.className = "filaResultado";

    let spanResultado = document.createElement("span");
    switch (resultado) {
        case "B":
            spanResultado.innerHTML = "1-0";
            break;
        case "N":
            spanResultado.innerHTML = "0-1";
            break;
        case "A":
            spanResultado.innerHTML = "1/2-1/2";
            break;
        case "I":
            spanResultado.innerHTML = "1/2-1/2";
            break;
        case "3":
            spanResultado.innerHTML = "1/2-1/2";
            break;
        case "5":
            spanResultado.innerHTML = "1/2-1/2";
            break;
    }

    nuevaFila.appendChild(spanResultado);
    tablaMov.appendChild(nuevaFila);
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
