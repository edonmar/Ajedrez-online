<?php

namespace AppBundle\Security;

use AppBundle\Entity\Partida;
use AppBundle\Entity\Usuario;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PartidaVoter extends Voter
{

    const PARTIDA_ENTRAR = 'PARTIDA_ENTRAR';

    private $accessDecisionManager;

    /**
     * UsuarioVoter constructor.
     */
    public function __construct(AccessDecisionManagerInterface $accessDecisionManager)
    {
        $this->accessDecisionManager = $accessDecisionManager;
    }


    /**
     * @inheritDoc
     */
    protected function supports($attribute, $subject)
    {
        if (in_array($attribute, [
            self::PARTIDA_ENTRAR
        ], true)) {
            return true;
        }

        return false;
    }

    /**
     * @inheritDoc
     */
    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $usuario = $token->getUser();

        if (!$usuario instanceof Usuario) {
            return false;
        }

        // Atributos que SÍ dependen de $subject

        // Comprobar si $subject es una Partida
        if (!$subject instanceof Partida) {
            return false;
        }

        switch ($attribute) {
            case self::PARTIDA_ENTRAR:
                // Se puede eliminar el usuario si se cumple alguna de estas condiciones:
                // 1. El usuario es uno de los dos jugadores de la partida
                if($subject->getJugadorAnfitrion() == $usuario || $subject->getJugadorInvitado() == $usuario) {
                    return true;
                }

                return false;
        }

        return false;
    }
}