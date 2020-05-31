<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class PartidaLocalController extends Controller
{
    /**
     * @Route("/partida_local", name="partida_local")
     */
    public function indexAction()
    {
        return $this->render('partida_local.html.twig');
    }
}
