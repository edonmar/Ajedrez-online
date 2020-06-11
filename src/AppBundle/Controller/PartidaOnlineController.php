<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Entity\Partida;
use AppBundle\Entity\Tablero;
use AppBundle\Repository\MensajeRepository;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\TableroRepository;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PartidaOnlineController extends Controller
{
    public $tablero = [];

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
     */
    public function movimientoYComprobaciones(Request $request, TableroRepository $tableroRepository, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));
        $tablero = $tableroRepository->findUltimoByPartida($partida);
        $tableroCasillas = $tablero[0]->getCasillas();

        $this->cadenaATablero($tableroCasillas);
        $this->moverPieza($request->get('origenX'), $request->get('origenY'),
            $request->get('destinoX'), $request->get('destinoY'));
        $cadena = $this->tableroACadena();
        $turno = !($tablero[0]->isTurno());
        $ultimoMov = $this->cadenaUltimoMov($request->get('origenX'), $request->get('origenY'),
            $request->get('destinoX'), $request->get('destinoY'));
        $this->nuevoTablero($partida, $cadena, $ultimoMov, $turno);
        $tablero = $tableroRepository->findUltimoByPartida($partida);
        $miColor = $this->colorJugador($partida);
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
            if ($partida->getJugadorAnfitrion() == $this->getUser()->getId())
                $miColor = true;
            else
                $miColor = false;
        } else {
            if ($partida->getJugadorAnfitrion() == $this->getUser()->getId())
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
        return strval($origenX).strval($origenY).strval($destinoX).strval($destinoY);
    }

    function moverPieza($origenX, $origenY, $destinoX, $destinoY)
    {
        $this->tablero[$destinoX][$destinoY] = $this->tablero[$origenX][$origenY];
        $this->tablero[$origenX][$origenY] = "0";
    }
}
