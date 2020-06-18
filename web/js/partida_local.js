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
        this.movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
        this.movidaEnroqueLargoBlanco = false;
        this.movidaEnroqueCortoNegro = false;
        this.movidaEnroqueLargoNegro = false;
        this.regla50MovBlancas = 0;    // Movimientos consecutivos desde el ultimo movimiento de peon o captura de pieza
        this.regla50MovNegras = 0;
        this.regla3RepMovimientos = [];    // Posiciones del tablero para comprobar si alguna se repite 3 veces (seria tablas)
        this.regla3RepTurnos = [];    // El turno de cada una de las posiciones del array regla3RepMovimientos
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
    iniciarEventosTablero();
    iniciarEventoBtnGirar();
};

// Al pulsar una pieza, la selecciono
// Si pulso una casilla a la que no me puedo mover, no pasa nada
// Si pulso una pieza y luego otra, selecciono la segunda
// Si pulso la misma pieza que ya esta seleccionada, la deselecciono
function clickEnCasilla(x, y) {
    if (miPartida.tableroGirado) {
        x = 7 - x;
        y = 7 - y;
    }

    let blanca = esBlanca(miPartida.tablero[x][y]);
    let negra = esNegra(miPartida.tablero[x][y]);

    if (!miPartida.hayPiezaSelec) {
        if (miPartida.turno && blanca || !miPartida.turno && negra)
            realizarSeleccionPieza(x, y);
    } else {
        if (esMovValido(x, y)) {
            if (siPeonPromociona(x))
                modalPromocionPeon(x, y);
            else
                realizarMovimientoYComprobaciones(x, y, false);
        } else {
            // Si la pieza pulsada no es la que estaba seleccionada, selecciono la nueva
            if (x !== miPartida.piezaSelec.x || y !== miPartida.piezaSelec.y) {
                // Compruebo que este pulsando una pieza y que sea de mi color
                if (miPartida.turno && blanca || !miPartida.turno && negra) {
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

function realizarMovimientoYComprobaciones(x, y, esPromocionPeon) {
    let finDePartida = false;
    let cabecera;
    let parrafo;
    let jaque = false;
    let mate = false;
    // Las siguientes variables son como estaba el tablero antes de mover la pieza. Las necesito para comprobar tablas
    let valorAnteriorCasillaOrigen;
    if (esPromocionPeon) {
        if (miPartida.turno)
            valorAnteriorCasillaOrigen = "P";
        else
            valorAnteriorCasillaOrigen = "p";
    } else
        valorAnteriorCasillaOrigen = miPartida.tablero[miPartida.piezaSelec.x][miPartida.piezaSelec.y];
    let valorAnteriorCasillaDestino = miPartida.tablero[x][y];
    let anteriorEnrCortoBlanco = miPartida.movidaEnroqueCortoBlanco;
    let anteriorEnrLargoBlanco = miPartida.movidaEnroqueLargoBlanco;
    let anteriorEnrCortoNegro = miPartida.movidaEnroqueCortoNegro;
    let anteriorEnrLargoNegro = miPartida.movidaEnroqueLargoNegro;

    let piezasAmbiguedad = obtenerPiezasAmbiguedad(x, y, valorAnteriorCasillaOrigen);
    eliminarEstiloMovAnterior();
    eliminarEstiloJaque();
    moverPieza(x, y);
    let haEnrocado = enroqueYComprobaciones(x, y);
    let haCapturadoAlPAso = capturaAlPasoYComprobaciones(x, y);
    eliminarEstiloMovPosibles();
    annadirEstiloMovAnterior(x, y);

    if (tieneMovimientos()) {
        if (esJaque(miPartida.turno)) {    // Jaque
            annadirEstiloJaque();
            jaque = true;
        }
    } else {
        finDePartida = true;
        if (esJaque(miPartida.turno)) {    // Jaque mate
            annadirEstiloJaque();
            mate = true;
            if (miPartida.turno) {
                miPartida.resultado = "1-0";
                cabecera = "Ganan las blancas";
            } else {
                miPartida.resultado = "0-1";
                cabecera = "Ganan las negras";
            }
            parrafo = "Jaque mate";
        } else {    // Rey ahogado
            miPartida.resultado = "1/2-1/2";
            cabecera = "Tablas"
            parrafo = "Rey agohado";
        }
    }

    escribirMovEnTabla(movANotacion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, x, y, piezasAmbiguedad,
        haEnrocado, haCapturadoAlPAso, jaque, mate));
    deseleccionarPieza();

    if (!finDePartida) {
        if (piezasInsuficientes(miPartida.piezasBlancas) && piezasInsuficientes(miPartida.piezasNegras)) {
            finDePartida = true;
            miPartida.resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "Falta de material para dar mate";
        } else if (tripleRepeticion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, anteriorEnrCortoBlanco,
            anteriorEnrLargoBlanco, anteriorEnrCortoNegro, anteriorEnrLargoNegro)) {
            finDePartida = true;
            miPartida.resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "Triple repetición de posiciones";
        } else if (regla50Movimientos(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino)) {
            finDePartida = true;
            miPartida.resultado = "1/2-1/2";
            cabecera = "Tablas";
            parrafo = "50 turnos sin mover peón ni realizar capturas";
        }
    }

    miPartida.movPosibles = [];
    miPartida.turno = !miPartida.turno;

    if (finDePartida)
        terminarPartida(cabecera, parrafo);
}

function terminarPartida(cabecera, parrafo) {
    eliminarEventosTablero();
    escribirResultado();
    modalFinDePartida(cabecera, parrafo);
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
    if (miPartida.turno)
        btnDama.classList.add("damaBlanco");
    else
        btnDama.classList.add("damaNegro");

    btnDama.onclick = function () {
        if (miPartida.turno)
            promocionarPeon(x, y, "D");
        else
            promocionarPeon(x, y, "d");
    }
    contenedorBtn.appendChild(btnDama);

    // Boton torre
    let btnTorre = document.createElement("div");
    btnTorre.classList.add("btnModal");
    btnTorre.innerHTML = "<div class='btnModalBorde'></div>";
    if (miPartida.turno)
        btnTorre.classList.add("torreBlanco");
    else
        btnTorre.classList.add("torreNegro");

    btnTorre.onclick = function () {
        if (miPartida.turno)
            promocionarPeon(x, y, "T");
        else
            promocionarPeon(x, y, "t");
    }
    contenedorBtn.appendChild(btnTorre);

    // Boton alfil
    let btnAlfil = document.createElement("div");
    btnAlfil.classList.add("btnModal");
    btnAlfil.innerHTML = "<div class='btnModalBorde'></div>";
    if (miPartida.turno)
        btnAlfil.classList.add("alfilBlanco");
    else
        btnAlfil.classList.add("alfilNegro");

    btnAlfil.onclick = function () {
        if (miPartida.turno)
            promocionarPeon(x, y, "A");
        else
            promocionarPeon(x, y, "a");
    }
    contenedorBtn.appendChild(btnAlfil);

    // Boton caballo
    let btnCaballo = document.createElement("div");
    btnCaballo.classList.add("btnModal");
    btnCaballo.innerHTML = "<div class='btnModalBorde'></div>";
    if (miPartida.turno)
        btnCaballo.classList.add("caballoBlanco");
    else
        btnCaballo.classList.add("caballoNegro");

    btnCaballo.onclick = function () {
        if (miPartida.turno)
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
        eliminarImgPieza(miPartida.piezaSelec.x, miPartida.piezaSelec.y);
        miPartida.tablero[miPartida.piezaSelec.x][miPartida.piezaSelec.y] = nuevaPieza;
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
        if (miPartida.tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "C")    // Rey y caballo
            piezasInsuficientes = true;
        else if (miPartida.tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "A")    // Rey y alfil
            piezasInsuficientes = true;
    } else if (longPiezas === 3) {
        if (miPartida.tablero[piezasColor[1].x][piezasColor[1].y].toUpperCase() === "C" &&
            miPartida.tablero[piezasColor[2].x][piezasColor[2].y].toUpperCase() === "C")    // Rey y dos caballos
            piezasInsuficientes = true;
    }
    // Rey y varios alfiles, pero todos los alfiles en casilla del mismo color
    if (!piezasInsuficientes && longPiezas > 2) {
        let soloAlfiles = true;

        for (let i = 1; i < longPiezas; i++) {
            if (miPartida.tablero[piezasColor[i].x][piezasColor[i].y].toUpperCase() !== "A") {
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
        anteriorEnrCortoBlanco !== miPartida.movidaEnroqueCortoBlanco || anteriorEnrLargoBlanco !== miPartida.movidaEnroqueLargoBlanco ||
        anteriorEnrCortoNegro !== miPartida.movidaEnroqueCortoNegro || anteriorEnrLargoNegro !== miPartida.movidaEnroqueLargoNegro) {
        miPartida.regla3RepMovimientos = [];
        miPartida.regla3RepTurnos = [];
    }

    // Creo una cadena con el valor de todas las casillas del tablero
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            cadena += miPartida.tablero[i][j];

    // Guarda en los arrays la cadena actual y el turno actual
    miPartida.regla3RepMovimientos.push(cadena);
    miPartida.regla3RepTurnos.push(miPartida.turno);

    // Comprueba si alguna cadena del array aparece 3 veces (el turno tambien tiene que repetirse)
    if (miPartida.regla3RepMovimientos.length >= 3) {
        let veces = 1;

        for (let i = 0, finI = miPartida.regla3RepMovimientos.length - 1; i < finI; i++) {
            veces = 1;
            for (let j = i + 1, finJ = miPartida.regla3RepMovimientos.length; j < finJ; j++) {
                if (miPartida.regla3RepMovimientos[i].localeCompare(miPartida.regla3RepMovimientos[j]) === 0 &&
                    miPartida.regla3RepTurnos[i] === miPartida.regla3RepTurnos[j])
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
        miPartida.regla50MovBlancas = 0;
        miPartida.regla50MovNegras = 0;
    } else {
        if (miPartida.turno)
            miPartida.regla50MovBlancas++;
        else
            miPartida.regla50MovNegras++;
    }

    return miPartida.regla50MovBlancas === 50 && miPartida.regla50MovNegras === 50;
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
        verRepeticion(miPartida.cadenaMovimientos);
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
    if (miPartida.hayPiezaSelec)
        eliminarEstiloMovPosibles();
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
    miPartida.movidaEnroqueCortoBlanco = false;
    miPartida.movidaEnroqueLargoBlanco = false;
    miPartida.movidaEnroqueCortoNegro = false;
    miPartida.movidaEnroqueLargoNegro = false;
    miPartida.regla50MovBlancas = 0;
    miPartida.regla50MovNegras = 0;
    miPartida.regla3RepMovimientos = [];
    miPartida.regla3RepTurnos = [];
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
    if (!repeticion)
        iniciarEventosTablero();
}

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
    miPartida.tableroGirado = !miPartida.tableroGirado;
}

function escribirResultado() {
    let tablaMov = document.getElementById("tablaMov");

    let nuevaFila = document.createElement("div");
    nuevaFila.className = "filaResultado";

    let spanResultado = document.createElement("span");
    spanResultado.innerHTML = miPartida.resultado;

    nuevaFila.appendChild(spanResultado);
    tablaMov.appendChild(nuevaFila);

    // Mueve el scroll hacia abajo
    tablaMov.scrollTop = tablaMov.scrollHeight;
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
