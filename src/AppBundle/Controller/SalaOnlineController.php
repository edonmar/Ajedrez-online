<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Repository\MensajeRepository;
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
    public function cargarMensajes(Request $request, MensajeRepository $mensajeRespository)
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
            $minutos = (($diff->y * 365.25 + $diff->m * 30 + $diff->d) * 24 + $diff->h) * 60 + $diff->i + $diff->s/60;

            if($minutos >= 120) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($m);
                $em->flush();
            }
        }
    }

    /**
     * @Route("/cargar_usuarios", name="cargar_usuarios")
     */
    public function cargar_usuarios(Request $request, UsuarioRepository $usuarioRepository)
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
}
