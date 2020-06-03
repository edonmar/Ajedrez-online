<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Usuario;
use AppBundle\Form\Type\UsuarioType;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\UsuarioRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
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

    /**
     * @Route("/usuario/nuevo", name="usuario_nuevo", methods={"GET", "POST"})
     */
    public function nuevoAction(Request $request)
    {
        $nuevoUsuario = new Usuario();
        $nuevoUsuario->setFechaRegistro(new \DateTime());
        $em = $this->getDoctrine()->getManager();
        $em->persist($nuevoUsuario);

        return $this->formAction($request, $nuevoUsuario);
    }

    /**
     * @Route("/usuario/form/{id}", name="usuario_form", methods={"GET", "POST"})
     */
    public function formAction(Request $request, Usuario $usuario)
    {
        $form = $this->createForm(UsuarioType::class, $usuario);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $em = $this->getDoctrine()->getManager();
                $em->flush();
                $this->addFlash('success', 'Cambios en el usuario guardados con éxito');
                return $this->redirectToRoute('usuario_listar');
            }
            catch(\Exception $e) {
                $this->addFlash('error', 'Ha ocurrido un error al guardar los cambios');
            }
        }
        return $this->render('usuario/form.html.twig', [
            'formulario' => $form->createView(),
            'usuario' => $usuario
        ]);
    }
}
