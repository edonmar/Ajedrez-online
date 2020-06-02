<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Usuario;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\UsuarioRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;

class UsuarioController extends Controller
{
    /**
     * @Route("/usuarios", name="usuario_listar")
     */
    public function indexAction(UsuarioRepository $usuarioRepository, PartidaRepository $partidaRepository)
    {
        $usuarios = $usuarioRepository->findOrdenadosPorNombre();
        $numPartidas = array();
        foreach ($usuarios as $usuario) {
            $numPartidas[] = $partidaRepository->contarPorUsuario($usuario);
        }

        return $this->render('usuario/listar.html.twig', [
            'usuarios' => $usuarios,
            'numPartidas' => $numPartidas
        ]);
    }

    /**
     * @Route("/usuario/partidas/{id}", name="usuario_partidas_listar")
     */
    public function partidasAction(PartidaRepository $partidaRepository, Usuario $usuario)
    {
        $partidas = $partidaRepository->findByUsuario($usuario);

        return $this->render('usuario/listar_partidas.html.twig', [
            'partidas' => $partidas,
            'usuario' => $usuario
        ]);
    }
}
