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
