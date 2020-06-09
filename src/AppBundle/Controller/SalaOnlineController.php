<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Entity\Partida;
use AppBundle\Repository\MensajeRepository;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\UsuarioRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SalaOnlineController extends Controller
{
    /**
     * @Route("/sala_online", name="sala_online")
     * @Security("is_granted('ROLE_USER')")
     */
    public function indexAction()
    {
        return $this->render('sala_online.html.twig');
    }

    /**
     * @Route("/nuevo_mensaje", name="nuevo_mensaje")
     */
    public function nuevoMensaje(Request $request)
    {
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
            $nuevoMensaje = new Mensaje();
            $nuevoMensaje->setFechaHora(new \DateTime());
            $nuevoMensaje->setTexto($texto);
            $nuevoMensaje->setUsuario($this->getUser());
            $em = $this->getDoctrine()->getManager();
            $em->persist($nuevoMensaje);
            $em->flush();
        }

        return new JsonResponse(['status' => 'ok']);
    }

    /**
     * @Route("/cargar_mensajes", name="cargar_mensajes")
     */
    public function cargarMensajes(MensajeRepository $mensajeRespository)
    {
        $mensajes = $mensajeRespository->findSinPartida();
        $this->eliminarMensajesAntiguos($mensajes);

        $lista = array();
        foreach ($mensajes as $m) {
            $objeto = new stdClass();
            $objeto->usuario = $m->getUsuario()->getNombre();
            $objeto->texto = $m->getTexto();
            array_push($lista, $objeto);
        }

        return new JsonResponse($lista);
    }

    // Se borran los mensajes que tengan mas de 2 horas
    public function eliminarMensajesAntiguos($mensajes)
    {
        foreach ($mensajes as $m) {
            $fechaActual = new \DateTime();
            $diff = date_diff($m->getFechaHora(), $fechaActual);
            $minutos = (($diff->y * 365.25 + $diff->m * 30 + $diff->d) * 24 + $diff->h) * 60 + $diff->i + $diff->s / 60;

            if ($minutos >= 120) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($m);
                $em->flush();
            }
        }
    }

    /**
     * @Route("/cargar_usuarios", name="cargar_usuarios")
     */
    public function cargar_usuarios(UsuarioRepository $usuarioRepository)
    {
        $usuarios = $usuarioRepository->findOrdenadosPorNombre();

        $lista = array();
        foreach ($usuarios as $u) {
            $objeto = new stdClass();
            $objeto->id = $u->getId();
            $objeto->nombre = $u->getNombre();
            array_push($lista, $objeto);
        }

        return new JsonResponse($lista);
    }

    /**
     * @Route("/invitar_partida", name="invitar_partida")
     */
    public function invitarPartida(Request $request, UsuarioRepository $usuarioRepository)
    {
        $idInvitado = $request->get('invitado');
        $usuarioInvitado = $usuarioRepository->findOneBy(array('id' => $idInvitado));
        $usuarioAnfitrion = $this->getUser();

        $nuevaPartida = new Partida();
        $nuevaPartida->setJugadorAnfitrion($usuarioAnfitrion->getId());
        $nuevaPartida->setJugadorInvitado($usuarioInvitado->getId());
        $nuevaPartida->setUsuarios(array($usuarioAnfitrion, $usuarioInvitado));
        $em = $this->getDoctrine()->getManager();
        $em->persist($nuevaPartida);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }

    /**
     * @Route("/cargar_invitaciones", name="cargar_invitaciones")
     */
    public function cargar_invitaciones(PartidaRepository $partidaRepository, UsuarioRepository $usuarioRepository)
    {
        $partidas = $partidaRepository->findInvitacionesByUsuarioOrdenadas($this->getUser());

        $lista = array();
        foreach ($partidas as $p) {
            $usuarioAnfitrion = $usuarioRepository->findOneBy(array('id' => $p->getJugadorAnfitrion()));
            $objeto = new stdClass();
            $objeto->id = $p->getId();
            $objeto->anfitrion = $usuarioAnfitrion->getNombre();
            array_push($lista, $objeto);
        }

        return new JsonResponse($lista);
    }

    /**
     * @Route("/rechazar_invitacion", name="rechazar_invitacion")
     */
    public function rechazarInvitacion(Request $request, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));

        $em = $this->getDoctrine()->getManager();
        $em->remove($partida);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }

    /**
     * @Route("/aceptar_invitacion", name="aceptar_invitacion")
     */
    public function aceptarInvitacion(Request $request, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));

        $partida->setJugadorBlancas(rand(0, 1) > 0.5);
        $partida->setNumMovimientos(0);
        $partida->setPgn("");
        $partida->setFechaInicio(new \DateTime());
        $em = $this->getDoctrine()->getManager();
        $em->flush();
    }


    /**
     * @Route("/cargar_partidas_en_curso", name="cargar_partidas_en_curso")
     */
    public function cargar_partidas_en_curso(PartidaRepository $partidaRepository)
    {
        $partidas = $partidaRepository->findEnCusro($this->getUser());

        $lista = array();
        foreach ($partidas as $p) {
            $jugadores = $p->getUsuarios();
            if ($jugadores[0]->getId() == $this->getUser()->getId())
                $rival = $jugadores[1]->getNombre();
            else
                $rival = $jugadores[0]->getNombre();

            $objeto = new stdClass();
            $objeto->id = $p->getId();
            $objeto->rival = $rival;
            array_push($lista, $objeto);
        }

        return new JsonResponse($lista);
    }
}
