<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class InicioController extends Controller
{
    /**
     * @Route("/", name="inicio")
     */
    public function indexAction()
    {
        return $this->render('inicio.html.twig');
    }
}
