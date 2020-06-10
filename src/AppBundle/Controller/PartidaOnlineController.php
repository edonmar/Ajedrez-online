<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Entity\Partida;
use AppBundle\Repository\MensajeRepository;
use AppBundle\Repository\PartidaRepository;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PartidaOnlineController extends Controller
{
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
}
