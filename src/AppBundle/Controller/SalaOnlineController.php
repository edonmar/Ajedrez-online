<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mensaje;
use AppBundle\Entity\Partida;
use AppBundle\Entity\Tablero;
use AppBundle\Repository\MensajeRepository;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\TableroRepository;
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
     * @Route("/cargar_mensajes_sala", name="cargar_mensajes_sala")
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
        $nuevaPartida->setJugadorAnfitrion($usuarioAnfitrion);
        $nuevaPartida->setJugadorInvitado($usuarioInvitado);
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
        $partidas = $partidaRepository->findInvitacionesOrdenadas($this->getUser());

        $lista = array();
        foreach ($partidas as $p) {
            $usuarioAnfitrion = $usuarioRepository->findOneBy(array('id' => $p->getJugadorAnfitrion()->getId()));
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

        // Valores iniciales de la partida
        $partida->setAnfitrionEsBlancas(rand(0, 1) > 0.5);
        $partida->setPgn("");
        $partida->setFechaInicio(new \DateTime());
        $em = $this->getDoctrine()->getManager();
        $em->flush();

        // Creo el primer tablero de la partida
        $nuevoTablero = new Tablero();
        $nuevoTablero->setPartida($partida);
        $nuevoTablero->setCasillas("tcadractpppppppp00000000000000000000000000000000PPPPPPPPTCADRACT");
        $nuevoTablero->setTurno(true);
        $nuevoTablero->setEnroques("DRdr");
        $nuevoTablero->setPeonAlPaso("");
        $nuevoTablero->setRegla50mov("0000");
        $nuevoTablero->setUltimoMov("");
        $nuevoTablero->setJaque(false);
        $em = $this->getDoctrine()->getManager();
        $em->persist($nuevoTablero);
        $em->flush();
    }

    /**
     * @Route("/cargar_partidas_en_curso", name="cargar_partidas_en_curso")
     */
    public function cargar_partidas_en_curso(PartidaRepository $partidaRepository, TableroRepository $tableroRepository)
    {
        $partidas = $partidaRepository->findEnCusro($this->getUser());

        $lista = array();
        foreach ($partidas as $p) {
            if ($p->getJugadorAnfitrion() == $this->getUser())
                $rival = $p->getJugadorInvitado()->getNombre();
            else
                $rival = $p->getJugadorAnfitrion()->getNombre();

            // Obtengo el numero de movimientos
            $num = $tableroRepository->contarByPartida($p) - 1;
            if ($num % 2 !== 0)
                $num++;
            $num = $num / 2;

            // Obtengo si es mi turno o no
            $ultimoTab = $tableroRepository->findUltimoByPartida($p);
            $colorTurno = $ultimoTab[0]->isTurno();
            if ($p->isAnfitrionEsBlancas()) {
                if ($p->getJugadorAnfitrion() === $this->getUser())
                    $miColor = true;
                else
                    $miColor = false;
            } else {
                if ($p->getJugadorAnfitrion() === $this->getUser())
                    $miColor = false;
                else
                    $miColor = true;
            }
            if ($colorTurno === $miColor)
                $miTurno = true;
            else
                $miTurno = false;

            $objeto = new stdClass();
            $objeto->id = $p->getId();
            $objeto->rival = $rival;
            $objeto->numMov = $num;
            $objeto->miColor = $miColor;
            $objeto->miTurno = $miTurno;
            array_push($lista, $objeto);
        }

        // Ordeno las partidas segun sea mi turno o no
        usort($lista, function ($a, $b) {
            if ($a->miTurno == $b->miTurno) return 0;
            if ($a->miTurno > $b->miTurno) return -1;
            return 1;
        });

        return new JsonResponse($lista);
    }
}
