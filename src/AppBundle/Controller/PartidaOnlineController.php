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

    /**
     * @Route("/partida_online/{id}", name="partida_online")
     */
    public function indexAction(Partida $partida)
    {
        return $this->render('partida_online.html.twig', [
            'partida' => $partida,
        ]);
    }

    /**
     * @Route("/nuevo_mensaje_partida", name="nuevo_mensaje_partida")
     */
    public function nuevoMensaje(Request $request, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $texto = $request->get('texto');
        $valido = false;

        // Compruebo que el mensaje no este en blanco
        if (strlen($texto) !== 0) {
            for ($i = 0, $finI = strlen($texto); $i < $finI; $i++)
                if ($texto[$i] !== " ") {
                    $valido = true;
                    break;
                }
        }

        if ($valido) {
            $partida = $partidaRepository->findOneBy(array('id' => $idPartida));

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

        // Compruebo que la partida este en curso
        if ($partida->getFechaInicio() !== null && $partida->getFechaFin() === null) {
            // Compruebo que el jugador que ha hecho la llamada es uno de los dos jugadores de la partida
            $miColor = $this->colorJugador($partida);
            if ($partida->getJugadorAnfitrion() === $this->getUser()->getId() ||
                $partida->getJugadorInvitado() === $this->getUser()->getId()) {
                $tableroCasillas = $tablero[0]->getCasillas();
                $this->cadenaATablero($tableroCasillas);
                // Comprueba que la pieza que se va a mover es del color del jugador que ha hecho la llamada, y que es su turno
                if ($miColor && ctype_upper($this->tablero[$origenX][$origenY]) && $tablero[0]->isTurno() ||
                    !$miColor && ctype_lower($this->tablero[$origenX][$origenY]) && !$tablero[0]->isTurno()) {
                    $this->calcularMovSegunPieza($origenX, $origenY);
                    // Comprueba que el movimiento que se va a realizar es valido
                    if ($valido = $this->esMovValido($destinoX, $destinoY)) {
                        $this->moverPieza($origenX, $origenY, $destinoX, $destinoY);
                        $cadena = $this->tableroACadena();
                        $turno = !($tablero[0]->isTurno());
                        $ultimoMov = $this->cadenaUltimoMov($origenX, $origenY, $destinoX, $destinoY);
                        $this->nuevoTablero($partida, $cadena, $ultimoMov, $turno);
                        $tablero = $tableroRepository->findUltimoByPartida($partida);
                    }
                }
            }
        }
        $objeto = $this->tableroRespuesta($tablero, $partida, $miColor);

        return new JsonResponse($objeto);
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
        $objeto->miColor = $miColor;

        return $objeto;
    }

    function nuevoTablero($partida, $cadena, $ultimoMov, $turno)
    {
        $nuevoTablero = new Tablero();
        $nuevoTablero->setPartida($partida);
        $nuevoTablero->setCasillas($cadena);
        $nuevoTablero->setTurno($turno);
        $nuevoTablero->setEnroques("DRdr");
        $nuevoTablero->setPeonAlPaso("");
        $nuevoTablero->setRegla50mov("0000");
        $nuevoTablero->setUltimoMov($ultimoMov);
        $nuevoTablero->setJaque(false);
        $em = $this->getDoctrine()->getManager();
        $em->persist($nuevoTablero);
        $em->flush();
    }

    // Obtengo el color del jugador que ha realizado la peticion
    function colorJugador($partida)
    {
        if ($partida->isJugadorBlancas()) {
            if ($partida->getJugadorAnfitrion() === $this->getUser()->getId())
                $miColor = true;
            else
                $miColor = false;
        } else {
            if ($partida->getJugadorAnfitrion() === $this->getUser()->getId())
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

    function cadenaUltimoMov($origenX, $origenY, $destinoX, $destinoY)
    {
        return strval($origenX) . strval($origenY) . strval($destinoX) . strval($destinoY);
    }

    function esMovValido($x, $y)
    {
        $mov = new stdClass();
        $mov->x = $x;
        $mov->y = $y;
        return in_array($mov, $this->movPosibles);
    }

    function moverPieza($origenX, $origenY, $destinoX, $destinoY)
    {
        $this->tablero[$destinoX][$destinoY] = $this->tablero[$origenX][$origenY];
        $this->tablero[$origenX][$origenY] = "0";
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
                //if ($x === 3 && $this->peonAlPaso->x === 3 && $this->peonAlPaso->y === $y - 1)
                //$this->annadirMov($x - 1, $y - 1);
            }

            // Capturar hacia la derecha
            if ($y < 7) {
                // Capturar normal
                if (ctype_lower($this->tablero[$x - 1][$y + 1]))
                    $this->annadirMov($x - 1, $y + 1);
                // Capturar al paso
                //if ($x === 3 && $this->peonAlPaso->x === 3 && $this->peonAlPaso->y === $y + 1)
                //$this->annadirMov($x - 1, $y + 1);
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
                //if ($x === 4 && $this->peonAlPaso->x === 4 && $this->peonAlPaso->y === $y - 1)
                //$this->annadirMov($x + 1, $y - 1);
            }

            // Capturar hacia la derecha
            if ($y < 7) {
                // Capturar normal
                if (ctype_upper($this->tablero[$x + 1][$y + 1]))
                    $this->annadirMov($x + 1, $y + 1);
                // Capturar al paso
                //if ($x === 4 && $this->peonAlPaso->x === 4 && $this->peonAlPaso->y === $y + 1)
                //$this->annadirMov($x + 1, $y + 1);
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
