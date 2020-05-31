<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class VisorPgnController extends Controller
{
    /**
     * @Route("/visor_pgn", name="visor_pgn")
     */
    public function indexAction()
    {
        return $this->render('visor_pgn.html.twig');
    }
}
