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

function girar() {
    let numeros = document.querySelectorAll("#numeros span");
    let letras = document.querySelectorAll("#letras span");

    girarTablero();
    girarSpans(numeros);
    girarSpans(letras);
    miPartida.tableroGirado = !miPartida.tableroGirado;
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

