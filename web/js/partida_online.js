class Partida {
    constructor() {
        this.tablero = [];    // El tablero donde se hacen todas las operaciones
        this.tableroHTML = [];    // El tablero que se muestra en pantalla (el del HTML)
        this.hayPiezaSelec = false;
        this.piezaSelec = {x: undefined, y: undefined};
        this.peonAlPaso = {x: undefined, y: undefined};    // Si hay un peon que pueda ser capturado al paso
        this.movPosibles = [];    // Array donde se van a guardar objetos con coordenadas de movimientos posibles
        this.piezasBlancas = [];    // Array con las coordenadas de todas las piezas blancas. El rey en la posicion 0
        this.piezasNegras = [];    // Array con las coordenadas de todas las piezas negras. El rey en la posicion 0
        this.movidaEnroqueCortoBlanco = false;    // Si una de las piezas implicadas en el enroque se mueve, no podra enrocar
        this.movidaEnroqueLargoBlanco = false;
        this.movidaEnroqueCortoNegro = false;
        this.movidaEnroqueLargoNegro = false;
        this.tableroGirado = false;
        this.cadenaMovimientos = "";
        this.turno = undefined;
        this.estadoActual = undefined;    // Si actualmente es mi turno o no
        this.partidaTerminada = false;
        this.idPartida = undefined;
        this.eresNegras = undefined;
    }
}

window.onload = function () {
    miPartida = new Partida();
    obtenerDatosPlantilla();
    cargarMensajes();
    iniciarIntervalos();
    iniciarEventosChat();
    inicializarTablero();
    inicializarTableroHTML();
    iniciarEventoBtnGirar();
    cargarTablero();
    if (miPartida.eresNegras)
        girar();
}

function iniciarIntervalos() {
    setInterval(function () {
        cargarMensajes();
        if (!miPartida.estadoActual && !miPartida.partidaTerminada)
            cargarTablero();
    }, 1000);
}

// Si es el turno del jugador, tiene acceso a los eventos de mover tablero
// Si no es el turno del jugador, llama al intervalo de la llamada ajax que comprueba cuando el otro jugador ha movido
function cambiarEstado(esMiTurno, resultado) {
    if (esMiTurno) {
        if (!miPartida.estadoActual && resultado === null) {
            iniciarEventosTablero();
            miPartida.estadoActual = true;
        }
    } else {
        if (miPartida.estadoActual) {
            eliminarEventosTablero();
            miPartida.estadoActual = false;
        }
    }
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

    xhr.open("GET", "/nuevo_mensaje_partida?partida=" + miPartida.idPartida + "&texto=" + texto, true);
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

    xhr.open("GET", "/cargar_mensajes_partida?partida=" + miPartida.idPartida, true);
    xhr.send();
}

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
    girarNombres();
    miPartida.tableroGirado = !miPartida.tableroGirado;
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

    xhr.open("GET", "/cargar_tablero?partida=" + miPartida.idPartida, true);
    xhr.send();
}

function actualizarTablero(respuesta) {
    miPartida.turno = respuesta.colorTurno;
    mostrarTurno(respuesta.colorTurno);
    mostrarTablero(respuesta.casillas);
    if (respuesta.ultimoMov !== "")
        mostrarUltimoMov(respuesta.ultimoMov);
    if (respuesta.jaque)
        mostrarJaque(respuesta.colorTurno);
    cargarCadenaMovimientos(respuesta.pgn);
    cargarEnroques(respuesta.enroques);
    cargarPeonAlPaso(respuesta.peonAlPaso);
    if (respuesta.resultado !== null) {
        miPartida.partidaTerminada = true;
        escribirResultado(respuesta.resultado);
        modalFinDePartida(respuesta.resultado);
    }

    let esMiTurno = respuesta.colorTurno === respuesta.miColor;
    cambiarEstado(esMiTurno, respuesta.resultado);
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
    miPartida.piezasBlancas = [];
    miPartida.piezasNegras = [];

    // Rellena el tablero con el valor de la cadena guardada
    // Tambien relleno los array de piezas
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Elimino estilos
            miPartida.tableroHTML[i][j].classList.remove("casillasMovAnterior");
            if (miPartida.tableroHTML[i][j].classList.contains("reyAmenazado")) {
                miPartida.tableroHTML[i][j].classList.remove("reyAmenazado");
                miPartida.tableroHTML[i][j].innerHTML = "";
            }

            // Cambio de pieza
            if (miPartida.tablero[i][j] !== casillas[pos]) {
                eliminarImgPieza(i, j);
                miPartida.tablero[i][j] = casillas[pos];
                annadirImgPieza(i, j);
            }

            if (esBlanca(casillas[pos]))
                miPartida.piezasBlancas.push({x: i, y: j});
            else if (esNegra(casillas[pos]))
                miPartida.piezasNegras.push({x: i, y: j});

            pos++;
        }
    }

    setReyPrimeraPos(miPartida.piezasBlancas, "R");
    setReyPrimeraPos(miPartida.piezasNegras, "r");

    function setReyPrimeraPos(piezasColor, valorRey) {
        for (let k = 0, finK = piezasColor.length; k < finK; k++) {
            if (miPartida.tablero[piezasColor[k].x][piezasColor[k].y] === valorRey) {
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

    casillaHTML.classList.add("reyAmenazado");
    casillaHTML.innerHTML = "<div class='piezaResaltadaBorde'></div>";
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

    // Mueve el scroll hacia abajo
    tablaMov.scrollTop = tablaMov.scrollHeight;
}

function cargarEnroques(enroques) {
    if (enroques.indexOf("D") === -1)
        miPartida.movidaEnroqueLargoBlanco = true;
    if (enroques.indexOf("R") === -1)
        miPartida.movidaEnroqueCortoBlanco = true;
    if (enroques.indexOf("d") === -1)
        miPartida.movidaEnroqueLargoNegro = true;
    if (enroques.indexOf("r") === -1)
        miPartida.movidaEnroqueCortoNegro = true;
}

function cargarPeonAlPaso(alPaso) {
    if (alPaso.length === 2) {
        miPartida.peonAlPaso.x = parseInt(alPaso[0]);
        miPartida.peonAlPaso.y = parseInt(alPaso[1]);
    } else {
        miPartida.peonAlPaso.x = undefined;
        miPartida.peonAlPaso.y = undefined;
    }
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
            else {
                enviarMovimiento(x, y, null);
                realizarMovimientoYComprobaciones(x, y, false);
            }
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

function enviarMovimiento(x, y, promocionPeon) {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let respuesta = JSON.parse(this.responseText);
            actualizarTablero(respuesta);
        }
    };

    xhr.open("GET", "/movimiento_y_comprobaciones?partida=" + miPartida.idPartida + "&origenX=" + miPartida.piezaSelec.x +
        "&origenY=" + miPartida.piezaSelec.y + "&destinoX=" + x + "&destinoY=" + y + "&promocionPeon=" + promocionPeon, true);
    xhr.send();
}

function realizarMovimientoYComprobaciones(x, y, esPromocionPeon) {
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
        if (esJaque(miPartida.turno)) {    // Jaque mate
            annadirEstiloJaque();
            mate = true;
        }
    }

    escribirMovEnTabla(movANotacion(valorAnteriorCasillaOrigen, valorAnteriorCasillaDestino, x, y, piezasAmbiguedad,
        haEnrocado, haCapturadoAlPAso, jaque, mate));
    deseleccionarPieza();

    miPartida.movPosibles = [];
    miPartida.turno = !miPartida.turno;
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
        enviarMovimiento(x, y, nuevaPieza);
        realizarMovimientoYComprobaciones(x, y, true);
    }
}

function modalFinDePartida(resultado) {
    let modal = document.getElementById("miModal");
    let cerrar = document.getElementById("modalCerrar");
    let titulo = document.getElementById("modalTitulo");
    let body = document.getElementById("modalBody");
    let nombreBlancas = document.querySelector(".nombreBlancas");
    let nombreNegras = document.querySelector(".nombreNegras");
    let cabecera;
    let parrafo;

    if (resultado === "B") {
        cabecera = "Gana " + nombreBlancas.innerHTML;
        parrafo = "Jaque mate";
    } else if (resultado === "N") {
        cabecera = "Gana " + nombreNegras.innerHTML;
        parrafo = "Jaque mate";
    } else if (resultado === "A") {
        cabecera = "Tablas";
        parrafo = "Rey ahogado";
    } else if (resultado === "I") {
        cabecera = "Tablas";
        parrafo = "Falta de material para dar mate";
    } else if (resultado === "3") {
        cabecera = "Tablas";
        parrafo = "Triple repetición de posiciones";
    } else if (resultado === "5") {
        cabecera = "Tablas";
        parrafo = "50 turnos sin mover peón ni realizar capturas";
    }

    titulo.innerHTML = cabecera;

    let p = document.createElement("P");
    p.innerHTML = parrafo;

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
