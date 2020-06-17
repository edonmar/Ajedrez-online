<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Partida;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\TableroRepository;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PartidaRepeticionController extends Controller
{
    /**
     * @Route("/partida_repeticion/{id}", name="partida_repeticion")
     */
    public function indexAction(Partida $partida)
    {
        return $this->render('partida_repeticion.html.twig', [
            'partida' => $partida,
        ]);
    }

    /**
     * @Route("/cargar_tableros", name="cargar_tableros")
     */
    public function cargarTableros(Request $request, TableroRepository $tableroRepository, PartidaRepository $partidaRepository)
    {
        $idPartida = $request->get('partida');
        $partida = $partidaRepository->findOneBy(array('id' => $idPartida));
        $tableros = $tableroRepository->findBy(array('partida' => $partida));

        $lista = array();
        foreach ($tableros as $t) {
            $objeto = new stdClass();
            $objeto->casillas = $t->getCasillas();
            $objeto->jaque = $t->isJaque();
            $objeto->ultimoMov = $t->getUltimoMov();
            $objeto->turno = $t->isTurno();
            array_push($lista, $objeto);
        }

        return new JsonResponse(['pgn' => $partida->getPgn(), 'resultado' => $partida->getResultado(), 'tableros' => $lista]);
    }
}
