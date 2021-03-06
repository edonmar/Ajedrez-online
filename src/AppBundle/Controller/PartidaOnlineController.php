<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Entity\Partida;
use AppBundle\Entity\Tablero;
use AppBundle\Repository\MensajeRepository;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\TableroRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PartidaOnlineController extends Controller
{
    public $tablero = [];
    public $movPosibles = [];
    public $piezasBlancas = [];
    public $piezasNegras = [];
    public $hayPiezaSelec = false;
    public $piezaSelec;
    public $peonAlPaso;
    public $movidaEnroqueCortoBlanco;
    public $movidaEnroqueLargoBlanco;
    public $movidaEnroqueCortoNegro;
    public $movidaEnroqueLargoNegro;
    public $regla50MovBlancas = 0;
    public $regla50MovNegras = 0;
    public $jaque;
    public $turno;
    public $resultado = null;
    public $pgn;

    /**
     * @Route("/partida_online/{id}", name="partida_online")
     * @Security("is_granted('PARTIDA_ENTRAR', partida)")
     */
    public function indexAction(Partida $partida)
    {
        return $this->render('partida_online.html.twig', [
            'partida' => $partida,
        ]);
    }

    /**
     * @Route("/nuevo_mensaje_partida", name="nuevo_mensaje_partida")
     * @Security("is_granted('ROLE_USER')")
     */
    public function nuevoMensaje(Request $request, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $texto = $request->get('texto');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));
        $valido = false;

        // Compruebo que el mensaje no este en blanco
        if (strlen($texto) !== 0) {
            for ($i = 0, $finI = strlen($texto); $i < $finI; $i++)
                if ($texto[$i] !== " ") {
                    $valido = true;
                    break;
                }
        }

        // Compruebo que el usuario que intenta mandar el mensaje es uno de los dos jugadores de la partida
        if($partida->getJugadorAnfitrion() !== $this->getUser() && $partida->getJugadorInvitado() !== $this->getUser())
            $valido = false;

        if ($valido) {
            $nuevoMensaje = new Mensaje();
            $nuevoMensaje->setFechaHora(new \DateTime());
            $nuevoMensaje->setPartida($partida);
            $nuevoMensaje->setTexto($texto);
            $nuevoMensaje->setUsuario($this->getUser());
            $em = $this->getDoctrine()->getManager();
            $em->persist($nuevoMensaje);
            $em->flush();
        }

        return new JsonResponse(['status' => 'ok']);
    }

    /**
     * @Route("/cargar_mensajes_partida", name="cargar_mensajes_partida")
     * @Security("is_granted('ROLE_USER')")
     */
    public function cargarMensajes(Request $request, MensajeRepository $mensajeRespository)
    {
        $idPartida = $request->get('partida');
        $mensajes = $mensajeRespository->findBy(array('partida' => $idPartida));

        $lista = array();
        foreach ($mensajes as $m) {
            $objeto = new stdClass();
            $objeto->usuario = $m->getUsuario()->getNombre();
            $objeto->texto = $m->getTexto();
            array_push($lista, $objeto);
        }

        return new JsonResponse($lista);
    }

    /**
     * @Route("/cargar_tablero", name="cargar_tablero")
     * @Security("is_granted('ROLE_USER')")
     */
    public function cargarTablero(Request $request, TableroRepository $tableroRepository, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));
        $tablero = $tableroRepository->findUltimoByPartida($partida);

        $miColor = $this->colorJugador($partida);
        $objeto = $this->tableroRespuesta($tablero, $partida, $miColor);

        return new JsonResponse($objeto);
    }

    /**
     * @Route("/movimiento_y_comprobaciones", name="movimiento_y_comprobaciones")
     * @Security("is_granted('ROLE_USER')")
     */
    public function movimientoYComprobaciones(Request $request, TableroRepository $tableroRepository, PartidaRepository $partidaRepository)
    {
        $origenX = (int)$request->get('origenX');
        $origenY = (int)$request->get('origenY');
        $destinoX = (int)$request->get('destinoX');
        $destinoY = (int)$request->get('destinoY');
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));
        $tablero = $tableroRepository->findUltimoByPartida($partida);
        $this->turno = $tablero[0]->isTurno();

        // Compruebo que la partida este en curso
        if ($partida->getFechaInicio() !== null && $partida->getFechaFin() === null) {
            // Compruebo que el jugador que ha hecho la llamada es uno de los dos jugadores de la partida
            $miColor = $this->colorJugador($partida);
            if ($partida->getJugadorAnfitrion() === $this->getUser() ||
                $partida->getJugadorInvitado() === $this->getUser()) {
                $this->cadenaATablero($tablero[0]->getCasillas());
                $this->setArrayPiezas();
                $this->setEnroques($tablero[0]->getEnroques());
                $this->setPeonAlPaso($tablero[0]->getPeonAlPaso());
                $this->setRegla50Mov($tablero[0]->getRegla50Mov());
                $this->pgn = $partida->getPgn();
                // Comprueba que la pieza que se va a mover es del color del jugador que ha hecho la llamada, y que es su turno
                if ($miColor && ctype_upper($this->tablero[$origenX][$origenY]) && $this->turno ||
                    !$miColor && ctype_lower($this->tablero[$origenX][$origenY]) && !$this->turno) {
                    $this->realizarSeleccionPieza($origenX, $origenY);
                    // Comprueba que el movimiento que se va a realizar es valido
                    if ($valido = $this->esMovValido($destinoX, $destinoY)) {
                        $finDePartida = $this->realizarMovimientoYComprobaciones($destinoX, $destinoY,
                            $request->get('promocionPeon'), $partida, $tableroRepository);
                        $cadena = $this->tableroACadena();
                        $ultimoMov = $this->cadenaUltimoMov($origenX, $origenY, $destinoX, $destinoY);
                        $peonAlPaso = $this->cadenaPeonAlPaso();
                        $enroques = $this->cadenaEnroques();
                        $regla50Mov = $this->cadenaRegla50Mov();
                        $this->turno = !$this->turno;
                        $this->nuevoTablero($partida, $cadena, $this->turno, $enroques, $peonAlPaso,
                            $regla50Mov, $ultimoMov, $this->jaque);
                        $tablero = $tableroRepository->findUltimoByPartida($partida);
                        $this->actualizarPartida($partida);
                        if ($finDePartida)
                            $this->finalizarPartida($partida);
                    }
                }
            }
        }
        $objeto = $this->tableroRespuesta($tablero, $partida, $miColor);

        return new JsonResponse($objeto);
    }

    function realizarSeleccionPieza($origenX, $origenY)
    {
        $this->calcularMovSegunPieza($origenX, $origenY);
        $this->seleccionarPieza($origenX, $origenY);
        $this->eliminarMovQueAmenazanAMiRey();
        if (strtoupper($this->tablero[$this->piezaSelec->x][$this->piezaSelec->y]) === "R")
            $this->annadirEnroquesPosibles();
    }

    function realizarMovimientoYComprobaciones($destinoX, $destinoY, $promocionPeon, $partida, $tableroRepository)
    {
        $finDePartida = false;
        $jaque = false;
        $mate = false;
        // Las siguientes variables son como estaba el tablero antes de mover la pieza. Las necesito para comprobar tablas
        if ($promocionPeon !== "null") {
            if ($this->turno)
                $valorAnteriorCasillaOrigen = "P";
            else
                $valorAnteriorCasillaOrigen = "p";
        } else
            $valorAnteriorCasillaOrigen = $this->tablero[$this->piezaSelec->x][$this->piezaSelec->y];
        $valorAnteriorCasillaDestino = $this->tablero[$destinoX][$destinoY];

        if ($promocionPeon !== "null")
            $this->tablero[$this->piezaSelec->x][$this->piezaSelec->y] = $promocionPeon;
        $piezasAmbiguedad = $this->obtenerPiezasAmbiguedad($destinoX, $destinoY, $valorAnteriorCasillaOrigen);
        $this->moverPieza($destinoX, $destinoY);
        $haEnrocado = $this->enroqueYComprobaciones($destinoX, $destinoY);
        $haCapturadoAlPAso = $this->capturaAlPasoYComprobaciones($destinoX, $destinoY);

        if ($this->esJaque($this->turno))
            $this->jaque = true;
        else
            $this->jaque = false;

        if ($this->tieneMovimientos()) {
            if ($this->esJaque($this->turno)) {
                $jaque = true;
            }
        } else {
            $finDePartida = true;
            if ($this->esJaque($this->turno)) {
                $mate = true;
                if ($this->turno)
                    $this->resultado = "B";
                else
                    $this->resultado = "N";
            } else
                $this->resultado = "A";
        }

        $this->annadirMovAPgn($this->movANotacion($valorAnteriorCasillaOrigen, $valorAnteriorCasillaDestino,
            $destinoX, $destinoY, $piezasAmbiguedad, $haEnrocado, $haCapturadoAlPAso, $jaque, $mate));

        if (!$finDePartida) {
            if ($this->piezasInsuficientes($this->piezasBlancas) && $this->piezasInsuficientes($this->piezasNegras)) {
                $finDePartida = true;
                $this->resultado = "I";
            } else if ($this->tripleRepeticion($partida, $tableroRepository)) {
                $finDePartida = true;
                $this->resultado = "3";
            } else if ($this->regla50Movimientos($valorAnteriorCasillaOrigen, $valorAnteriorCasillaDestino)) {
                $finDePartida = true;
                $this->resultado = "5";
            }
        }

        return $finDePartida;
    }

    function tableroRespuesta($tablero, $partida, $miColor)
    {
        $objeto = new stdClass();
        $objeto->casillas = $tablero[0]->getCasillas();
        $objeto->colorTurno = $tablero[0]->isTurno();
        $objeto->enroques = $tablero[0]->getEnroques();
        $objeto->peonAlPaso = $tablero[0]->getPeonAlPaso();
        $objeto->ultimoMov = $tablero[0]->getUltimoMov();
        $objeto->jaque = $tablero[0]->isJaque();
        $objeto->pgn = $partida->getPgn();
        $objeto->resultado = $partida->getResultado();
        $objeto->miColor = $miColor;

        return $objeto;
    }

    function nuevoTablero($partida, $cadena, $turno, $enroques, $peonAlPaso, $regla50Mov, $ultimoMov, $jaque)
    {
        $nuevoTablero = new Tablero();
        $nuevoTablero->setPartida($partida);
        $nuevoTablero->setCasillas($cadena);
        $nuevoTablero->setTurno($turno);
        $nuevoTablero->setEnroques($enroques);
        $nuevoTablero->setPeonAlPaso($peonAlPaso);
        $nuevoTablero->setRegla50mov($regla50Mov);
        $nuevoTablero->setUltimoMov($ultimoMov);
        $nuevoTablero->setJaque($jaque);
        $em = $this->getDoctrine()->getManager();
        $em->persist($nuevoTablero);
        $em->flush();
    }

    function actualizarPartida($partida)
    {
        $partida->setPgn($this->pgn);
        $em = $this->getDoctrine()->getManager();
        $em->flush();
    }

    function finalizarPartida($partida)
    {
        $partida->setResultado($this->resultado);
        $partida->setFechaFin(new \DateTime());
        $em = $this->getDoctrine()->getManager();
        $em->flush();
    }

    // Obtengo el color del jugador que ha realizado la peticion
    function colorJugador($partida)
    {
        if ($partida->isAnfitrionEsBlancas()) {
            if ($partida->getJugadorAnfitrion() === $this->getUser())
                $miColor = true;
            else
                $miColor = false;
        } else {
            if ($partida->getJugadorAnfitrion() === $this->getUser())
                $miColor = false;
            else
                $miColor = true;
        }

        return $miColor;
    }

    function cadenaATablero($tableroCasillas)
    {
        $n = 0;
        for ($i = 0; $i < 8; $i++) {
            for ($j = 0; $j < 8; $j++) {
                $this->tablero[$i][$j] = $tableroCasillas[$n];
                $n++;
            }
        }
    }

    function tableroACadena()
    {
        $cadena = "";
        for ($i = 0; $i < 8; $i++)
            for ($j = 0; $j < 8; $j++)
                $cadena .= $this->tablero[$i][$j];

        return $cadena;
    }

    function setArrayPiezas()
    {
        for ($i = 0; $i < 8; $i++) {
            for ($j = 0; $j < 8; $j++) {
                $tipo = $this->tablero[$i][$j];
                if ($tipo !== "0") {
                    $pieza = new stdClass();
                    $pieza->x = $i;
                    $pieza->y = $j;

                    if (ctype_upper($tipo)) {
                        if ($tipo === "R")
                            array_unshift($this->piezasBlancas, $pieza);
                        else
                            array_push($this->piezasBlancas, $pieza);
                    } else if (ctype_lower($tipo)) {
                        if ($tipo === "r")
                            array_unshift($this->piezasNegras, $pieza);
                        else
                            array_push($this->piezasNegras, $pieza);
                    }
                }
            }
        }
    }

    function setPeonAlPaso($cadenaPeonAlPaso)
    {
        $objeto = new stdClass();
        if (strlen($cadenaPeonAlPaso) === 2) {
            $objeto->x = (int)$cadenaPeonAlPaso[0];
            $objeto->y = (int)$cadenaPeonAlPaso[1];
        } else {
            $objeto->x = null;
            $objeto->y = null;
        }
        $this->peonAlPaso = $objeto;
    }

    function setRegla50Mov($cadenaRegla50Mov)
    {
        $this->regla50MovBlancas = (int)($cadenaRegla50Mov[0] . $cadenaRegla50Mov[1]);
        $this->regla50MovNegras = (int)($cadenaRegla50Mov[2] . $cadenaRegla50Mov[3]);
    }

    function cadenaUltimoMov($origenX, $origenY, $destinoX, $destinoY)
    {
        return strval($origenX) . strval($origenY) . strval($destinoX) . strval($destinoY);
    }

    function cadenaPeonAlPaso()
    {
        return strval($this->peonAlPaso->x) . strval($this->peonAlPaso->y);
    }

    function cadenaEnroques()
    {
        $enroques = "";

        if (!$this->movidaEnroqueLargoBlanco)
            $enroques .= "D";
        if (!$this->movidaEnroqueCortoBlanco)
            $enroques .= "R";
        if (!$this->movidaEnroqueLargoNegro)
            $enroques .= "d";
        if (!$this->movidaEnroqueCortoNegro)
            $enroques .= "r";

        return $enroques;
    }

    function cadenaRegla50Mov()
    {
        $cadenaBlancas = strval($this->regla50MovBlancas);
        if (strlen($cadenaBlancas) === 1)
            $cadenaBlancas = "0" . $cadenaBlancas;

        $cadenaNegras = strval($this->regla50MovNegras);
        if (strlen($cadenaNegras) === 1)
            $cadenaNegras = "0" . $cadenaNegras;

        return $cadenaBlancas . $cadenaNegras;
    }

    function setEnroques($cadenaEnroques)
    {
        if (strpos($cadenaEnroques, "D") === false)
            $this->movidaEnroqueLargoBlanco = true;
        else
            $this->movidaEnroqueLargoBlanco = false;

        if (strpos($cadenaEnroques, "R") === false)
            $this->movidaEnroqueCortoBlanco = true;
        else
            $this->movidaEnroqueCortoBlanco = false;

        if (strpos($cadenaEnroques, "d") === false)
            $this->movidaEnroqueLargoNegro = true;
        else
            $this->movidaEnroqueLargoNegro = false;

        if (strpos($cadenaEnroques, "r") === false)
            $this->movidaEnroqueCortoNegro = true;
        else
            $this->movidaEnroqueCortoNegro = false;
    }

    function seleccionarPieza($x, $y)
    {
        $this->hayPiezaSelec = true;

        $objeto = new stdClass();
        $objeto->x = $x;
        $objeto->y = $y;
        $this->piezaSelec = $objeto;
    }

    function esMovValido($x, $y)
    {
        $mov = new stdClass();
        $mov->x = $x;
        $mov->y = $y;
        return in_array($mov, $this->movPosibles);
    }

    function moverPieza($x, $y)
    {
        $captura = false;

        if ($this->tablero[$x][$y] !== "0")
            $captura = true;

        $this->tablero[$x][$y] = $this->tablero[$this->piezaSelec->x][$this->piezaSelec->y];
        $this->tablero[$this->piezaSelec->x][$this->piezaSelec->y] = "0";

        if ($this->turno) {
            $this->piezasBlancas = $this->cambiarObjetoPiezaMovida($this->piezasBlancas, $x, $y);
            if ($captura)
                $this->piezasNegras = $this->eliminarObjetoPiezaCapturada($this->piezasNegras, $x, $y);
        } else {
            $this->piezasNegras = $this->cambiarObjetoPiezaMovida($this->piezasNegras, $x, $y);
            if ($captura)
                $this->piezasBlancas = $this->eliminarObjetoPiezaCapturada($this->piezasBlancas, $x, $y);
        }
    }

    // Cambia las coordenadas de la pieza en el array de objetos
    function cambiarObjetoPiezaMovida($piezasColor, $x, $y)
    {
        $index = $this->buscarPiezaEnArray($piezasColor, $this->piezaSelec->x, $this->piezaSelec->y);

        $piezasColor[$index]->x = $x;
        $piezasColor[$index]->y = $y;

        return $piezasColor;
    }

    // Comprueba si se ha capturado una pieza y elimina la pieza capturada del array del otro color
    function eliminarObjetoPiezaCapturada($piezasColor, $x, $y)
    {
        $index = $this->buscarPiezaEnArray($piezasColor, $x, $y);
        array_splice($piezasColor, $index, 1);
        return $piezasColor;
    }

    function buscarPiezaEnArray($piezasColor, $x, $y)
    {
        for ($i = 0, $finI = sizeof($piezasColor); $i < $finI; $i++) {
            if ($piezasColor[$i]->x === $x && $piezasColor[$i]->y === $y) {
                $index = $i;
                break;
            }
        }
        return $index;
    }

    // Comprueba todos los movimientos posibles de todas las piezas de un color
    // Acaba el bucle y devuelve true si uno de los movimientos es capturar al rey del otro color
    function esJaque($colorAmenazante)
    {
        $movPosiblesAux = $this->movPosibles;
        $jaque = false;

        if ($colorAmenazante) {
            $piezasAmenazantes = $this->piezasBlancas;
            $reyAmenazado = "r";
        } else {
            $piezasAmenazantes = $this->piezasNegras;
            $reyAmenazado = "R";
        }

        $numPiezasAmenazantes = sizeof($piezasAmenazantes);
        $i = 0;
        do {
            $this->movPosibles = [];
            $this->calcularMovSegunPieza($piezasAmenazantes[$i]->x, $piezasAmenazantes[$i]->y);
            for ($j = 0, $finI = sizeof($this->movPosibles); $j < $finI; $j++) {
                if ($this->tablero[$this->movPosibles[$j]->x][$this->movPosibles[$j]->y] === $reyAmenazado) {
                    $jaque = true;
                    break;
                }
            }
            $i++;
        } while ($i < $numPiezasAmenazantes && !$jaque);

        $this->movPosibles = $movPosiblesAux;

        return $jaque;
    }

    // Para cada movimiento posible de la pieza seleccionada:
    // Compruebo si al hacer ese movimiento mi rey quedaria en jaque
    // Si queda en jaque, elimino ese movimiento de movPosibles
    function eliminarMovQueAmenazanAMiRey()
    {
        if (sizeof($this->movPosibles) > 0) {
            $valorCasillaOrigen = $this->tablero[$this->piezaSelec->x][$this->piezaSelec->y];
            $i = 0;

            do {
                if ($this->movAmenazaReyPropio($i, !$this->turno, $this->piezaSelec, $valorCasillaOrigen))
                    array_splice($this->movPosibles, $i, 1);
                else
                    $i++;
            } while ($i < sizeof($this->movPosibles));
        }
    }

    // Llamando a la funcion esJaque, compruebo si al hacer un movimiento el rey del color movido quedaria en jaque
    function movAmenazaReyPropio($i, $colorAmenazante, $casillaOrigen, $valorCasillaOrigen)
    {
        $jaque = false;
        $capturaNormal = false;
        $capturaAlPaso = false;
        $casillaDestinoX = $this->movPosibles[$i]->x;
        $casillaDestinoY = $this->movPosibles[$i]->y;
        $valorCasillaDestino = $this->tablero[$casillaDestinoX][$casillaDestinoY];

        // Compruebo si ha comido de manera normal
        if (ctype_lower($valorCasillaOrigen) && ctype_upper($valorCasillaDestino)) {
            $colorCapturada = $this->piezasBlancas;
            $capturaNormal = true;
        } else if (ctype_upper($valorCasillaOrigen) && ctype_lower($valorCasillaDestino)) {
            $colorCapturada = $this->piezasNegras;
            $capturaNormal = true;
        } else if (strtoupper($valorCasillaOrigen) === "P") {
            // Si ha comido al paso
            if ($casillaOrigen->x === $this->peonAlPaso->x && $casillaDestinoY === $this->peonAlPaso->y) {
                if ($casillaDestinoX === $this->peonAlPaso->x - 1) {
                    $colorCapturada = $this->piezasNegras;
                    $capturaAlPaso = true;
                } else if ($casillaDestinoX === $this->peonAlPaso->x + 1) {
                    $colorCapturada = $this->piezasBlancas;
                    $capturaAlPaso = true;
                }
            }
        }

        // Si el movimiento captura una pieza, simulo eliminar la pieza capturada de su array
        if ($capturaNormal)
            $colorCapturada = $this->eliminarObjetoPiezaCapturada($colorCapturada, $casillaDestinoX, $casillaDestinoY);
        else if ($capturaAlPaso)
            $colorCapturada = $this->eliminarObjetoPiezaCapturada($colorCapturada, $this->peonAlPaso->x, $this->peonAlPaso->y);

        // Simulo mover una pieza para ver como quedaria el tablero si hiciera ese movimiento
        $this->tablero[$casillaOrigen->x][$casillaOrigen->y] = "0";
        $this->tablero[$casillaDestinoX][$casillaDestinoY] = $valorCasillaOrigen;
        if ($capturaAlPaso)
            $this->tablero[$this->peonAlPaso->x][$this->peonAlPaso->y] = "0";

        // Realizo la comprobacion
        if ($this->esJaque($colorAmenazante))
            $jaque = true;

        // Vuelvo a colocar las piezas donde estaban antes de simular el movimiento
        $this->tablero[$casillaOrigen->x][$casillaOrigen->y] = $valorCasillaOrigen;
        $this->tablero[$casillaDestinoX][$casillaDestinoY] = $valorCasillaDestino;
        if ($capturaAlPaso) {
            if ($colorCapturada)
                $this->tablero[$this->peonAlPaso->x][$this->peonAlPaso->y] = "P";
            else
                $this->tablero[$this->peonAlPaso->x][$this->peonAlPaso->y] = "p";
        }

        return $jaque;
    }

    // Compruebo si el color contrario al que acaba de mover tiene algun movimiento posible
    // Para cada movimiento de cada pieza, compruebo si al hacer ese movimiento el rey de ese color quedaria en jaque
    // Si hay al menos un movimiento que sea posible sin colocar a su propio rey en jaque, acaba el bucle y devuelve true
    function tieneMovimientos()
    {
        $puedeMover = false;

        if ($this->turno)
            $piezasAmenazadas = $this->piezasNegras;
        else
            $piezasAmenazadas = $this->piezasBlancas;

        $numPiezasAmenazadas = sizeof($piezasAmenazadas);
        $i = 0;
        do {
            $this->movPosibles = [];
            $this->calcularMovSegunPieza($piezasAmenazadas[$i]->x, $piezasAmenazadas[$i]->y);
            $numMovimientos = sizeof($this->movPosibles);
            if ($numMovimientos > 0) {
                $valorCasillaOrigen = $this->tablero[$piezasAmenazadas[$i]->x][$piezasAmenazadas[$i]->y];
                $j = 0;
                do {
                    if (!$this->movAmenazaReyPropio($j, $this->turno, $piezasAmenazadas[$i], $valorCasillaOrigen))
                        $puedeMover = true;
                    $j++;
                } while ($j < $numMovimientos && !$puedeMover);
            }
            $i++;
        } while ($i < $numPiezasAmenazadas && !$puedeMover);

        return $puedeMover;
    }

    // Comprueba cuando se mueve el rey o la torre. Ese color no podra hacer enroque
    // Comprueba si el movimiento que se acaba de hacer es un enroque y mueve la torre
    function enroqueYComprobaciones($x, $y)
    {
        $haEnrocado = new stdClass();
        $haEnrocado->corto = false;
        $haEnrocado->largo = false;

        if ($this->tablero[$x][$y] === "T") {    // Si ha movido torre blanca
            if ($this->piezaSelec->y === 0)
                $this->movidaEnroqueLargoBlanco = true;
            if ($this->piezaSelec->y === 7)
                $this->movidaEnroqueCortoBlanco = true;
        } else if ($this->tablero[$x][$y] === "t") {    // Si ha movido torre negra
            if ($this->piezaSelec->y === 0)
                $this->movidaEnroqueLargoNegro = true;
            if ($this->piezaSelec->y === 7)
                $this->movidaEnroqueCortoNegro = true;
        } else if (strtoupper($this->tablero[$x][$y]) === "R") {    // Si ha movido un rey
            // Si el movimiento es un enroque (el rey mueve 2 posiciones)
            if (abs($this->piezaSelec->y - $y) === 2) {
                if ($this->turno)
                    $x = 7;
                else
                    $x = 0;

                if ($y === 6) {    // Enroque corto
                    $posYOrigenTorre = 7;
                    $posYDestinoTorre = 5;
                    $haEnrocado->corto = true;
                } else {    // Enroque largo
                    $posYOrigenTorre = 0;
                    $posYDestinoTorre = 3;
                    $haEnrocado->largo = true;
                }

                // Selecciono la torre y la muevo
                $this->seleccionarPieza($x, $posYOrigenTorre);
                $this->moverPieza($x, $posYDestinoTorre);
                // Vuelvo a seleccionar la casilla de origen del rey
                $this->seleccionarPieza($x, 4);
            }

            if ($this->turno) {
                $this->movidaEnroqueLargoBlanco = true;
                $this->movidaEnroqueCortoBlanco = true;
            } else {
                $this->movidaEnroqueLargoNegro = true;
                $this->movidaEnroqueCortoNegro = true;
            }
        }

        return $haEnrocado;
    }

    // Comprueba si se ha seleccionado un rey y si tiene algun enroque disponible
    // Si lo hay, comprueba todos los movimientos posibles de todas las piezas del otro color
    // Si ninguno de esos movimientos amenaza al rey o a las casillas por las que pasa, annade el enroque a movPosibles
    function annadirEnroquesPosibles()
    {
        $comprobarEnroqueCorto = false;
        $comprobarEnroqueLargo = false;

        if ($this->turno) {
            $piezasAmenazantes = $this->piezasNegras;
            $x = 7;
        } else {
            $piezasAmenazantes = $this->piezasBlancas;
            $x = 0;
        }

        // Enroque corto
        if ($this->turno && !$this->movidaEnroqueCortoBlanco ||
            !$this->turno && !$this->movidaEnroqueCortoNegro)
            if ($this->tablero[$x][5] === "0" && $this->tablero[$x][6] === "0")
                $comprobarEnroqueCorto = true;

        // Enroque largo
        if ($this->turno && !$this->movidaEnroqueLargoBlanco ||
            !$this->turno && !$this->movidaEnroqueLargoNegro)
            if ($this->tablero[$x][1] === "0" && $this->tablero[$x][2] === "0" &&
                $this->tablero[$x][3] === "0")
                $comprobarEnroqueLargo = true;

        if ($comprobarEnroqueCorto || $comprobarEnroqueLargo) {
            $enroqueCortoAmenazado = false;
            $enroqueLargoAmenazado = false;
            $movPosiblesAux = $this->movPosibles;
            $numPiezasAmenazantes = sizeof($piezasAmenazantes);
            $i = 0;

            do {
                $this->movPosibles = [];
                $this->calcularMovSegunPieza($piezasAmenazantes[$i]->x, $piezasAmenazantes[$i]->y);
                for ($j = 0, $finI = sizeof($this->movPosibles); $j < $finI; $j++) {
                    if ($this->movPosibles[$j]->x === $x) {
                        if ($this->movPosibles[$j]->y === 4) {
                            $enroqueCortoAmenazado = true;
                            $enroqueLargoAmenazado = true;
                            break;
                        }
                        if ($comprobarEnroqueCorto && !$enroqueCortoAmenazado)
                            if ($this->movPosibles[$j]->y === 5 || $this->movPosibles[$j]->y === 6)
                                $enroqueCortoAmenazado = true;
                        if ($comprobarEnroqueLargo && !$enroqueLargoAmenazado)
                            if ($this->movPosibles[$j]->y === 3 || $this->movPosibles[$j]->y === 2 ||
                                $this->movPosibles[$j]->y === 1)
                                $enroqueLargoAmenazado = true;
                    }
                    if ($enroqueCortoAmenazado && $enroqueLargoAmenazado)
                        break;
                }
                $i++;
            } while ($i < $numPiezasAmenazantes && (!$enroqueCortoAmenazado || !$enroqueLargoAmenazado));

            $this->movPosibles = $movPosiblesAux;

            if ($comprobarEnroqueCorto && !$enroqueCortoAmenazado) {
                $mov = new stdClass();
                $mov->x = $x;
                $mov->y = 6;
                array_push($this->movPosibles, $mov);
            }

            if ($comprobarEnroqueLargo && !$enroqueLargoAmenazado) {
                $mov = new stdClass();
                $mov->x = $x;
                $mov->y = 2;
                array_push($this->movPosibles, $mov);
            }
        }
    }

    // Comprueba cuando un peon mueve dos casillas y lo guarda para que pueda ser capturado al paso
    // Comprueba si el movimiento que se acaba de hacer es una captura al paso y elimina el peon capturado
    function capturaAlPasoYComprobaciones($x, $y)
    {
        $haCapturadoAlPAso = false;

        // Si la pieza movida es un peon
        if (strtoupper($this->tablero[$x][$y]) === "P") {
            // Si ha avanzado dos casillas
            if (abs($this->piezaSelec->x - $x) === 2) {
                $this->peonAlPaso->x = $x;
                $this->peonAlPaso->y = $y;
            } else {
                if ($this->turno) {
                    if ($x === $this->peonAlPaso->x - 1) {    // Si las blancas han capturado al paso
                        $this->tablero[$x + 1][$y] = "0";
                        $this->piezasNegras = $this->eliminarObjetoPiezaCapturada($this->piezasNegras, $x + 1, $y);
                        $haCapturadoAlPAso = true;
                    }
                } else {    // Si comen las negras
                    if ($x === $this->peonAlPaso->x + 1) {    // Si las negras han capturado al paso
                        $this->tablero[$x - 1][$y] = "0";
                        $this->piezasBlancas = $this->eliminarObjetoPiezaCapturada($this->piezasBlancas, $x - 1, $y);
                        $haCapturadoAlPAso = true;
                    }
                }
                $this->peonAlPaso->x = null;
                $this->peonAlPaso->y = null;
            }
        } else {
            $this->peonAlPaso->x = null;
            $this->peonAlPaso->y = null;
        }

        return $haCapturadoAlPAso;
    }

    // Si se da uno de estos casos, devuelve true. Significa que un color no tiene piezas suficientes para ganar
    function piezasInsuficientes($piezasColor)
    {
        $piezasInsuficientes = false;
        $longPiezas = sizeof($piezasColor);

        if ($longPiezas === 1)    // Rey solo
            $piezasInsuficientes = true;
        else if ($longPiezas === 2) {
            if (strtoupper($this->tablero[$piezasColor[1]->x][$piezasColor[1]->y]) === "C")    // Rey y caballo
                $piezasInsuficientes = true;
            else if (strtoupper($this->tablero[$piezasColor[1]->x][$piezasColor[1]->y]) === "A")    // Rey y alfil
                $piezasInsuficientes = true;
        } else if ($longPiezas === 3) {
            if (strtoupper($this->tablero[$piezasColor[1]->x][$piezasColor[1]->y]) === "C" &&
                strtoupper($this->tablero[$piezasColor[2]->x][$piezasColor[2]->y]) === "C")    // Rey y dos caballos
                $piezasInsuficientes = true;
        }
        // Rey y varios alfiles, pero todos los alfiles en casilla del mismo color
        if (!$piezasInsuficientes && $longPiezas > 2) {
            $soloAlfiles = true;

            for ($i = 1; $i < $longPiezas; $i++) {
                if (strtoupper($this->tablero[$piezasColor[$i]->x][$piezasColor[$i]->y]) !== "A") {
                    $soloAlfiles = false;
                    break;
                }
            }
            if ($soloAlfiles) {
                $todosMismoColorCasilla = true;
                $primerColorCasilla = null;

                for ($i = 1; $i < $longPiezas; $i++) {
                    if ($piezasColor[$i]->x % 2 === 0)
                        $colorCasilla = $piezasColor[$i]->y % 2 === 0;
                    else
                        $colorCasilla = $piezasColor[$i]->y % 2 !== 0;

                    if ($i === 1)
                        $primerColorCasilla = $colorCasilla;
                    else {
                        if ($primerColorCasilla !== $colorCasilla) {
                            $todosMismoColorCasilla = false;
                            break;
                        }
                    }
                }
                if ($todosMismoColorCasilla)
                    $piezasInsuficientes = true;
            }
        }

        return $piezasInsuficientes;
    }

    function tripleRepeticion($partida, TableroRepository $tableroRepository)
    {
        $tablas = false;
        $tableros = $tableroRepository->findBy(array('partida' => $partida));
        $casillas = $this->tableroACadena();
        $enroques = $this->cadenaEnroques();

        // Comprueba si el tablero actual se repite 3 veces (casillas, enroques y turno)
        if (sizeof($tableros) >= 3) {
            $veces = 1;
            for ($i = 1, $finI = sizeof($tableros); $i < $finI; $i++) {
                if (strcmp($casillas, $tableros[$i]->getCasillas()) === 0 &&
                    strcmp($enroques, $tableros[$i]->getEnroques()) === 0 && $this->turno === !$tableros[$i]->isTurno())
                    $veces++;
            }
            if ($veces >= 3)
                $tablas = true;
        }

        return $tablas;
    }

    function regla50Movimientos($valorAnteriorCasillaOrigen, $valorAnteriorCasillaDestino)
    {
        // Si cualquiera de los colores captura una pieza o mueve un peon, pone los dos contadores a 0
        if (strtoupper($valorAnteriorCasillaOrigen) === "P" || $valorAnteriorCasillaDestino !== "0") {
            $this->regla50MovBlancas = 0;
            $this->regla50MovNegras = 0;
        } else {
            if ($this->turno)
                $this->regla50MovBlancas++;
            else
                $this->regla50MovNegras++;
        }

        return $this->regla50MovBlancas === 50 && $this->regla50MovNegras === 50;
    }

    function annadirMovAPgn($notacionMov)
    {
        $subStrings = explode(" ", $this->pgn);

        if ($this->turno) {
            if (sizeof($subStrings) === 1)
                $this->pgn .= "1.";
            else
                $this->pgn .= " " . ((sizeof($subStrings) / 3) + 1) . ".";
        }

        $this->pgn .= " " . $notacionMov;
    }

    // Obtiene la notacion en texto de un movimiento, usando la notacion algebraica
    function movANotacion($tipoOrigen, $tipoDestino, $x, $y, $piezasAmbiguedad, $haEnrocado, $haCapturadoAlPAso,
                          $jaque, $mate)
    {
        $notacion = "";
        $tipoOrigen = strtoupper($tipoOrigen);

        if ($haEnrocado->corto)
            $notacion = "O-O";
        else if ($haEnrocado->largo)
            $notacion = "O-O-O";
        else {
            // Si no es un peon, annade el tipo de pieza
            if ($tipoOrigen !== "P")
                $notacion .= $tipoOrigen;

            // Desambiguacion (annado letra y/o numero para especificar cual de las piezas se mueve)
            if (sizeof($piezasAmbiguedad) > 0) {
                $coincideMismaLetra = false;
                $coincideMismoNumero = false;

                for ($i = 0, $finI = sizeof($piezasAmbiguedad); $i < $finI; $i++) {
                    if ($this->piezaSelec->y === $piezasAmbiguedad[$i]->y)
                        $coincideMismaLetra = true;
                    if ($this->piezaSelec->x === $piezasAmbiguedad[$i]->x)
                        $coincideMismoNumero = true;
                }

                if (!$coincideMismaLetra)
                    $notacion .= $this->posicionALetra($this->piezaSelec->y);
                else {
                    if (!$coincideMismoNumero)
                        $notacion .= $this->posicionANumero($this->piezaSelec->x);
                    else
                        $notacion .= $this->posicionALetra($this->piezaSelec->y) . $this->posicionANumero($this->piezaSelec->x);
                }
            }

            // Si captura, annade una x
            if ($tipoDestino !== "0" || $haCapturadoAlPAso) {
                if ($tipoOrigen === "P")    // Si la pieza que captura es peon, annade su letra de origen antes de la x
                    $notacion .= $this->posicionALetra($this->piezaSelec->y);
                $notacion .= "x";
            }

            // Annade la nueva casilla
            $notacion .= $this->posicionALetra($y);
            $notacion .= $this->posicionANumero($x);

            // Si peon promociona
            if ($tipoOrigen === "P" && ($x === 0 || $x === 7))
                $notacion .= "=" . strtoupper($this->tablero[$x][$y]);
        }
        // Annade si es jaque o mate
        if ($jaque)
            $notacion .= "+";
        else if ($mate)
            $notacion .= "#";

        return $notacion;
    }

    // Compruebo si, aparte de la pieza movida, hay otra pieza del mismo tipo que pueda realizar el mismo movimiento
    // Necesito saberlo a la hora de escribir la notacion del movimiento
    function obtenerPiezasAmbiguedad($x, $y, $tipoOrigen)
    {
        $piezasMismoTipo = [];
        $piezasAmbiguedad = [];

        // Si no es peon ni rey
        if (strtoupper($tipoOrigen) !== "P" && strtoupper($tipoOrigen) !== "R") {
            if ($this->turno)
                $piezasColor = $this->piezasBlancas;
            else
                $piezasColor = $this->piezasNegras;

            // Obtiene las piezas del mismo tipo
            for ($i = 0, $finI = sizeof($piezasColor); $i < $finI; $i++) {
                if ($this->tablero[$piezasColor[$i]->x][$piezasColor[$i]->y] === $tipoOrigen)
                    if ($this->piezaSelec->x !== $piezasColor[$i]->x ||
                        $this->piezaSelec->y !== $piezasColor[$i]->y) {

                        $pieza = new stdClass();
                        $pieza->x = $piezasColor[$i]->x;
                        $pieza->y = $piezasColor[$i]->y;
                        array_push($piezasMismoTipo, $pieza);
                    }
            }

            // Obtiene las piezas del mismo tipo que provocan anbiguedad
            if (sizeof($piezasMismoTipo) > 0) {
                $movPosiblesAux = $this->movPosibles;

                for ($i = 0, $finI = sizeof($piezasMismoTipo); $i < $finI; $i++) {
                    $this->movPosibles = [];
                    $this->calcularMovSegunPieza($piezasMismoTipo[$i]->x, $piezasMismoTipo[$i]->y);
                    for ($j = 0, $finJ = sizeof($this->movPosibles); $j < $finJ;
                         $j++) {
                        if ($x === $this->movPosibles[$j]->x && $y === $this->movPosibles[$j]->y) {
                            if (!$this->movAmenazaReyPropio($j, !$this->turno, $piezasMismoTipo[$i], $tipoOrigen))
                                array_push($piezasAmbiguedad, $piezasMismoTipo[$i]);
                        }
                    }
                }

                $this->movPosibles = $movPosiblesAux;
            }
        }

        return $piezasAmbiguedad;
    }

    function posicionANumero($x)
    {
        return (8 - $x);
    }

    function posicionALetra($y)
    {
        switch ($y) {
            case 0:
                $letra = "a";
                break;
            case 1:
                $letra = "b";
                break;
            case 2:
                $letra = "c";
                break;
            case 3:
                $letra = "d";
                break;
            case 4:
                $letra = "e";
                break;
            case 5:
                $letra = "f";
                break;
            case 6:
                $letra = "g";
                break;
            case 7:
                $letra = "h";
                break;
        }

        return $letra;
    }

    function calcularMovSegunPieza($x, $y)
    {
        $tipo = $this->tablero[$x][$y];

        if (ctype_upper($tipo)) {
            switch ($tipo) {
                case "P":
                    $this->calcularMovPeonBlanco($x, $y);
                    break;
                case "T":
                    $this->calcularMovTorreBlanco($x, $y);
                    break;
                case "C":
                    $this->calcularMovCaballoBlanco($x, $y);
                    break;
                case "A":
                    $this->calcularMovAlfilBlanco($x, $y);
                    break;
                case "D":
                    $this->calcularMovDamaBlanco($x, $y);
                    break;
                case "R":
                    $this->calcularMovReyBlanco($x, $y);
                    break;
            }
        } else {
            switch ($tipo) {
                case "p":
                    $this->calcularMovPeonNegro($x, $y);
                    break;
                case "t":
                    $this->calcularMovTorreNegro($x, $y);
                    break;
                case "c":
                    $this->calcularMovCaballoNegro($x, $y);
                    break;
                case "a":
                    $this->calcularMovAlfilNegro($x, $y);
                    break;
                case "d":
                    $this->calcularMovDamaNegro($x, $y);
                    break;
                case "r":
                    $this->calcularMovReyNegro($x, $y);
                    break;
            }
        }
    }

    function annadirMov($x, $y)
    {
        $mov = new stdClass();
        $mov->x = $x;
        $mov->y = $y;
        array_push($this->movPosibles, $mov);
    }

    function calcularMovPeonBlanco($x, $y)
    {
        if ($x !== 0) {
            // Una casilla hacia delante
            if ($this->tablero[$x - 1][$y] === "0")
                $this->annadirMov($x - 1, $y);

            // Capturar hacia la izquierda
            if ($y > 0) {
                // Capturar normal
                if (ctype_lower($this->tablero[$x - 1][$y - 1]))
                    $this->annadirMov($x - 1, $y - 1);
                // Capturar al paso
                if ($x === 3 && $this->peonAlPaso->x === 3 && $this->peonAlPaso->y === $y - 1)
                    $this->annadirMov($x - 1, $y - 1);
            }

            // Capturar hacia la derecha
            if ($y < 7) {
                // Capturar normal
                if (ctype_lower($this->tablero[$x - 1][$y + 1]))
                    $this->annadirMov($x - 1, $y + 1);
                // Capturar al paso
                if ($x === 3 && $this->peonAlPaso->x === 3 && $this->peonAlPaso->y === $y + 1)
                    $this->annadirMov($x - 1, $y + 1);
            }
        }

        // Dos casillas hacia delante
        if ($x === 6 && $this->tablero[5][$y] === "0" && $this->tablero[4][$y] === "0")
            $this->annadirMov(4, $y);
    }

    function calcularMovPeonNegro($x, $y)
    {
        if ($x !== 7) {
            // Una casilla hacia delante
            if ($this->tablero[$x + 1][$y] === "0")
                $this->annadirMov($x + 1, $y);

            // Capturar hacia la izquierda
            if ($y > 0) {
                // Capturar normal
                if (ctype_upper($this->tablero[$x + 1][$y - 1]))
                    $this->annadirMov($x + 1, $y - 1);
                // Capturar al paso
                if ($x === 4 && $this->peonAlPaso->x === 4 && $this->peonAlPaso->y === $y - 1)
                    $this->annadirMov($x + 1, $y - 1);
            }

            // Capturar hacia la derecha
            if ($y < 7) {
                // Capturar normal
                if (ctype_upper($this->tablero[$x + 1][$y + 1]))
                    $this->annadirMov($x + 1, $y + 1);
                // Capturar al paso
                if ($x === 4 && $this->peonAlPaso->x === 4 && $this->peonAlPaso->y === $y + 1)
                    $this->annadirMov($x + 1, $y + 1);
            }
        }

        // Dos casillas hacia delante
        if ($x === 1 && $this->tablero[2][$y] === "0" && $this->tablero[3][$y] === "0")
            $this->annadirMov(3, $y);
    }

    function calcularMovTorreBlanco($x, $y)
    {
        // Arriba
        $i = 1;
        while ($x - $i >= 0) {
            if (ctype_upper($this->tablero[$x - $i][$y]))
                break;
            $this->annadirMov($x - $i, $y);
            if (ctype_lower($this->tablero[$x - $i][$y]))
                break;
            $i++;
        }

        // Derecha
        $i = 1;
        while ($y + $i <= 7) {
            if (ctype_upper($this->tablero[$x][$y + $i]))
                break;
            $this->annadirMov($x, $y + $i);
            if (ctype_lower($this->tablero[$x][$y + $i]))
                break;
            $i++;
        }

        // Abajo
        $i = 1;
        while ($x + $i <= 7) {
            if (ctype_upper($this->tablero[$x + $i][$y]))
                break;
            $this->annadirMov($x + $i, $y);
            if (ctype_lower($this->tablero[$x + $i][$y]))
                break;
            $i++;
        }

        // Izquierda
        $i = 1;
        while ($y - $i >= 0) {
            if (ctype_upper($this->tablero[$x][$y - $i]))
                break;
            $this->annadirMov($x, $y - $i);
            if (ctype_lower($this->tablero[$x][$y - $i]))
                break;
            $i++;
        }
    }

    function calcularMovTorreNegro($x, $y)
    {
        // Arriba
        $i = 1;
        while ($x - $i >= 0) {
            if (ctype_lower($this->tablero[$x - $i][$y]))
                break;
            $this->annadirMov($x - $i, $y);
            if (ctype_upper($this->tablero[$x - $i][$y]))
                break;
            $i++;
        }

        // Derecha
        $i = 1;
        while ($y + $i <= 7) {
            if (ctype_lower($this->tablero[$x][$y + $i]))
                break;
            $this->annadirMov($x, $y + $i);
            if (ctype_upper($this->tablero[$x][$y + $i]))
                break;
            $i++;
        }

        // Abajo
        $i = 1;
        while ($x + $i <= 7) {
            if (ctype_lower($this->tablero[$x + $i][$y]))
                break;
            $this->annadirMov($x + $i, $y);
            if (ctype_upper($this->tablero[$x + $i][$y]))
                break;
            $i++;
        }

        // Izquierda
        $i = 1;
        while ($y - $i >= 0) {
            if (ctype_lower($this->tablero[$x][$y - $i]))
                break;
            $this->annadirMov($x, $y - $i);
            if (ctype_upper($this->tablero[$x][$y - $i]))
                break;
            $i++;
        }
    }

    function calcularMovCaballoBlanco($x, $y)
    {
        // Arriba - Izquierda
        if ($x - 1 >= 0 && $y - 2 >= 0)
            if (!ctype_upper($this->tablero[$x - 1][$y - 2]))
                $this->annadirMov($x - 1, $y - 2);
        if ($x - 2 >= 0 && $y - 1 >= 0)
            if (!ctype_upper($this->tablero[$x - 2][$y - 1]))
                $this->annadirMov($x - 2, $y - 1);

        // Arriba - Derecha
        if ($x - 1 >= 0 && $y + 2 <= 7)
            if (!ctype_upper($this->tablero[$x - 1][$y + 2]))
                $this->annadirMov($x - 1, $y + 2);
        if ($x - 2 >= 0 && $y + 1 <= 7)
            if (!ctype_upper($this->tablero[$x - 2][$y + 1]))
                $this->annadirMov($x - 2, $y + 1);

        // Abajo - Derecha
        if ($x + 1 <= 7 && $y + 2 <= 7)
            if (!ctype_upper($this->tablero[$x + 1][$y + 2]))
                $this->annadirMov($x + 1, $y + 2);
        if ($x + 2 <= 7 && $y + 1 <= 7)
            if (!ctype_upper($this->tablero[$x + 2][$y + 1]))
                $this->annadirMov($x + 2, $y + 1);

        // Abajo - Izquierda
        if ($x + 1 <= 7 && $y - 2 >= 0)
            if (!ctype_upper($this->tablero[$x + 1][$y - 2]))
                $this->annadirMov($x + 1, $y - 2);
        if ($x + 2 <= 7 && $y - 1 >= 0)
            if (!ctype_upper($this->tablero[$x + 2][$y - 1]))
                $this->annadirMov($x + 2, $y - 1);
    }

    function calcularMovCaballoNegro($x, $y)
    {
        // Arriba - Izquierda
        if ($x - 1 >= 0 && $y - 2 >= 0)
            if (!ctype_lower($this->tablero[$x - 1][$y - 2]))
                $this->annadirMov($x - 1, $y - 2);
        if ($x - 2 >= 0 && $y - 1 >= 0)
            if (!ctype_lower($this->tablero[$x - 2][$y - 1]))
                $this->annadirMov($x - 2, $y - 1);

        // Arriba - Derecha
        if ($x - 1 >= 0 && $y + 2 <= 7)
            if (!ctype_lower($this->tablero[$x - 1][$y + 2]))
                $this->annadirMov($x - 1, $y + 2);
        if ($x - 2 >= 0 && $y + 1 <= 7)
            if (!ctype_lower($this->tablero[$x - 2][$y + 1]))
                $this->annadirMov($x - 2, $y + 1);

        // Abajo - Derecha
        if ($x + 1 <= 7 && $y + 2 <= 7)
            if (!ctype_lower($this->tablero[$x + 1][$y + 2]))
                $this->annadirMov($x + 1, $y + 2);
        if ($x + 2 <= 7 && $y + 1 <= 7)
            if (!ctype_lower($this->tablero[$x + 2][$y + 1]))
                $this->annadirMov($x + 2, $y + 1);

        // Abajo - Izquierda
        if ($x + 1 <= 7 && $y - 2 >= 0)
            if (!ctype_lower($this->tablero[$x + 1][$y - 2]))
                $this->annadirMov($x + 1, $y - 2);
        if ($x + 2 <= 7 && $y - 1 >= 0)
            if (!ctype_lower($this->tablero[$x + 2][$y - 1]))
                $this->annadirMov($x + 2, $y - 1);
    }

    function calcularMovAlfilBlanco($x, $y)
    {
        // Arriba - Izquierda
        $i = 1;
        $j = 1;
        while ($x - $i >= 0 && $y - $j >= 0) {
            if (ctype_upper($this->tablero[$x - $i][$y - $j]))
                break;
            $this->annadirMov($x - $i, $y - $j);
            if (ctype_lower($this->tablero[$x - $i][$y - $j]))
                break;
            $i++;
            $j++;
        }

        // Arriba - Derecha
        $i = 1;
        $j = 1;
        while ($x - $i >= 0 && $y + $j <= 7) {
            if (ctype_upper($this->tablero[$x - $i][$y + $j]))
                break;
            $this->annadirMov($x - $i, $y + $j);
            if (ctype_lower($this->tablero[$x - $i][$y + $j]))
                break;
            $i++;
            $j++;
        }

        // Abajo - Derecha
        $i = 1;
        $j = 1;
        while ($x + $i <= 7 && $y + $j <= 7) {
            if (ctype_upper($this->tablero[$x + $i][$y + $j]))
                break;
            $this->annadirMov($x + $i, $y + $j);
            if (ctype_lower($this->tablero[$x + $i][$y + $j]))
                break;
            $i++;
            $j++;
        }

        // Abajo - Izquierda
        $i = 1;
        $j = 1;
        while ($x + $i <= 7 && $y - $j >= 0) {
            if (ctype_upper($this->tablero[$x + $i][$y - $j]))
                break;
            $this->annadirMov($x + $i, $y - $j);
            if (ctype_lower($this->tablero[$x + $i][$y - $j]))
                break;
            $i++;
            $j++;
        }
    }

    function calcularMovAlfilNegro($x, $y)
    {
        // Arriba - Izquierda
        $i = 1;
        $j = 1;
        while ($x - $i >= 0 && $y - $j >= 0) {
            if (ctype_lower($this->tablero[$x - $i][$y - $j]))
                break;
            $this->annadirMov($x - $i, $y - $j);
            if (ctype_upper($this->tablero[$x - $i][$y - $j]))
                break;
            $i++;
            $j++;
        }

        // Arriba - Derecha
        $i = 1;
        $j = 1;
        while ($x - $i >= 0 && $y + $j <= 7) {
            if (ctype_lower($this->tablero[$x - $i][$y + $j]))
                break;
            $this->annadirMov($x - $i, $y + $j);
            if (ctype_upper($this->tablero[$x - $i][$y + $j]))
                break;
            $i++;
            $j++;
        }

        // Abajo - Derecha
        $i = 1;
        $j = 1;
        while ($x + $i <= 7 && $y + $j <= 7) {
            if (ctype_lower($this->tablero[$x + $i][$y + $j]))
                break;
            $this->annadirMov($x + $i, $y + $j);
            if (ctype_upper($this->tablero[$x + $i][$y + $j]))
                break;
            $i++;
            $j++;
        }

        // Abajo - Izquierda
        $i = 1;
        $j = 1;
        while ($x + $i <= 7 && $y - $j >= 0) {
            if (ctype_lower($this->tablero[$x + $i][$y - $j]))
                break;
            $this->annadirMov($x + $i, $y - $j);
            if (ctype_upper($this->tablero[$x + $i][$y - $j]))
                break;
            $i++;
            $j++;
        }
    }

    function calcularMovDamaBlanco($x, $y)
    {
        $this->calcularMovTorreBlanco($x, $y);
        $this->calcularMovAlfilBlanco($x, $y);
    }

    function calcularMovDamaNegro($x, $y)
    {
        $this->calcularMovTorreNegro($x, $y);
        $this->calcularMovAlfilNegro($x, $y);
    }

    function calcularMovReyBlanco($x, $y)
    {
        // Arriba - Izquierda
        if ($x - 1 >= 0 && $y - 1 >= 0)
            if (!ctype_upper($this->tablero[$x - 1][$y - 1]))
                $this->annadirMov($x - 1, $y - 1);

        // Arriba
        if ($x - 1 >= 0)
            if (!ctype_upper($this->tablero[$x - 1][$y]))
                $this->annadirMov($x - 1, $y);

        // Arriba - Derecha
        if ($x - 1 >= 0 && $y + 1 <= 7)
            if (!ctype_upper($this->tablero[$x - 1][$y + 1]))
                $this->annadirMov($x - 1, $y + 1);

        // Derecha
        if ($y + 1 <= 7)
            if (!ctype_upper($this->tablero[$x][$y + 1]))
                $this->annadirMov($x, $y + 1);

        // Abajo - Derecha
        if ($x + 1 <= 7 && $y + 1 <= 7)
            if (!ctype_upper($this->tablero[$x + 1][$y + 1]))
                $this->annadirMov($x + 1, $y + 1);

        // Abajo
        if ($x + 1 <= 7)
            if (!ctype_upper($this->tablero[$x + 1][$y]))
                $this->annadirMov($x + 1, $y);

        // Abajo - Izquierda
        if ($x + 1 <= 7 && $y - 1 >= 0)
            if (!ctype_upper($this->tablero[$x + 1][$y - 1]))
                $this->annadirMov($x + 1, $y - 1);

        // Izquierda
        if ($y - 1 >= 0)
            if (!ctype_upper($this->tablero[$x][$y - 1]))
                $this->annadirMov($x, $y - 1);
    }

    function calcularMovReyNegro($x, $y)
    {
        // Arriba - Izquierda
        if ($x - 1 >= 0 && $y - 1 >= 0)
            if (!ctype_lower($this->tablero[$x - 1][$y - 1]))
                $this->annadirMov($x - 1, $y - 1);

        // Arriba
        if ($x - 1 >= 0)
            if (!ctype_lower($this->tablero[$x - 1][$y]))
                $this->annadirMov($x - 1, $y);

        // Arriba - Derecha
        if ($x - 1 >= 0 && $y + 1 <= 7)
            if (!ctype_lower($this->tablero[$x - 1][$y + 1]))
                $this->annadirMov($x - 1, $y + 1);

        // Derecha
        if ($y + 1 <= 7)
            if (!ctype_lower($this->tablero[$x][$y + 1]))
                $this->annadirMov($x, $y + 1);

        // Abajo - Derecha
        if ($x + 1 <= 7 && $y + 1 <= 7)
            if (!ctype_lower($this->tablero[$x + 1][$y + 1]))
                $this->annadirMov($x + 1, $y + 1);

        // Abajo
        if ($x + 1 <= 7)
            if (!ctype_lower($this->tablero[$x + 1][$y]))
                $this->annadirMov($x + 1, $y);

        // Abajo - Izquierda
        if ($x + 1 <= 7 && $y - 1 >= 0)
            if (!ctype_lower($this->tablero[$x + 1][$y - 1]))
                $this->annadirMov($x + 1, $y - 1);

        // Izquierda
        if ($y - 1 >= 0)
            if (!ctype_lower($this->tablero[$x][$y - 1]))
                $this->annadirMov($x, $y - 1);
    }
}
