<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Usuario;
use AppBundle\Form\Model\CambioClave;
use AppBundle\Form\Type\CambioClaveType;
use AppBundle\Form\Type\MiUsuarioType;
use AppBundle\Form\Type\UsuarioType;
use AppBundle\Repository\PartidaRepository;
use AppBundle\Repository\TableroRepository;
use AppBundle\Repository\UsuarioRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

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
            $numPartidas[] = $partidaRepository->contarTerminadasByUsuario($usuario);
        }

        return $this->render('usuario/listar.html.twig', [
            'usuarios' => $usuarios,
            'numPartidas' => $numPartidas
        ]);
    }

    /**
     * @Route("/usuario/partidas/{id}", name="usuario_partidas_listar")
     */
    public function partidasAction(PartidaRepository $partidaRepository, TableroRepository $tableroRepository, Usuario $usuario)
    {
        $partidas = $partidaRepository->findTerminadasByUsuario($usuario);
        $numMov = array();
        foreach ($partidas as $p) {
            $num = $tableroRepository->contarByPartida($p) - 1;
            if($num % 2 !== 0)
                $num++;
            $numMov[] = $num / 2;
        }

        return $this->render('usuario/listar_partidas.html.twig', [
            'partidas' => $partidas,
            'numMov' => $numMov,
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

    /**
     * @Route("/usuario/eliminar/{id}", name="usuario_eliminar", methods={"GET", "POST"})
     */
    public function eliminarAction(Request $request, Usuario $usuario)
    {
        if ($request->getMethod() == 'POST') {
            try {
                $em = $this->getDoctrine()->getManager();
                $em->remove($usuario);
                $em->flush();
                $this->addFlash('success', 'Usuario eliminado con éxito');
                return $this->redirectToRoute('usuario_listar');
            }
            catch (\Exception $e) {
                $this->addFlash('error', 'Ha ocurrido un error al eliminar el usuario. Puede que no se pueda eliminar porque tiene aportes.');
                return $this->redirectToRoute('usuario_form', ['id' => $usuario->getId()]);
            }
        }
        return $this->render('usuario/eliminar.html.twig', [
            'usuario' => $usuario
        ]);
    }

    /**
     * @Route("/perfil", name="usuario_perfil", methods={"GET", "POST"})
     * @Security("is_granted('ROLE_USER')")
     */
    public function perfilAction(Request $request)
    {
        $usuario = $this->getUser();
        $form = $this->createForm(MiUsuarioType::class, $usuario);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $em = $this->getDoctrine()->getManager();
                $em->flush();
                $this->addFlash('success', 'Cambios en el usuario guardados con éxito');
                return $this->redirectToRoute('portada');
            }
            catch(\Exception $e) {
                $this->addFlash('error', 'Ha ocurrido un error al guardar los cambios');
            }
        }
        return $this->render('usuario/perfil_form.html.twig', [
            'formulario' => $form->createView(),
            'usuario' => $usuario
        ]);
    }

    /**
     * @Route("/usuario/clave/{id}", name="usuario_establecer_clave", methods={"GET", "POST"})
     * @Security("is_granted('ROLE_ADMINISTRADOR')")
     */
    public function establecerClaveAction(
        Request $request,
        UserPasswordEncoderInterface $encoder,
        Usuario $usuario
    ) {
        $cambioClave = new CambioClave();

        $form = $this->createForm(CambioClaveType::class, $cambioClave, [
            'es_admin' => true
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $em = $this->getDoctrine()->getManager();
                $usuario->setClave(
                    $encoder->encodePassword($usuario, $cambioClave->getNuevaClave())
                );
                $em->flush();
                $this->addFlash('success', 'Cambios en la contraseña guardados con éxito');
                return $this->redirectToRoute('usuario_form', ['id' => $usuario->getId()]);
            }
            catch(\Exception $e) {
                $this->addFlash('error', 'Ha ocurrido un error al guardar la contraseña');
            }
        }
        return $this->render('usuario/establecer_clave_form.html.twig', [
            'formulario' => $form->createView(),
            'usuario' => $usuario
        ]);
    }

    /**
     * @Route("/perfil/clave", name="usuario_cambiar_clave", methods={"GET", "POST"})
     * @Security("is_granted('ROLE_USER')")
     */
    public function cambioClaveAction(Request $request, UserPasswordEncoderInterface $encoder)
    {
        $cambioClave = new CambioClave();

        $form = $this->createForm(CambioClaveType::class, $cambioClave);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $em = $this->getDoctrine()->getManager();
                /** @var Usuario $user */
                $user = $this->getUser();
                $user->setClave(
                    $encoder->encodePassword($user, $cambioClave->getNuevaClave())
                );
                $em->flush();
                $this->addFlash('success', 'Cambios en la contraseña guardados con éxito');
                return $this->redirectToRoute('usuario_perfil');
            }
            catch(\Exception $e) {
                $this->addFlash('error', 'Ha ocurrido un error al guardar la contraseña');
            }
        }
        return $this->render('usuario/cambio_clave_form.html.twig', [
            'formulario' => $form->createView()
        ]);
    }
}
