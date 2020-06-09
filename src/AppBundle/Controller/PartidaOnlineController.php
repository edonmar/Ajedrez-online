<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Partida;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
}
