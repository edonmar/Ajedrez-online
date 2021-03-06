<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="mensaje")
 */
class Mensaje
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     * @var int
     */
    private $id;

    /**
     * @ORM\Column(type="string")
     * @var string
     */
    private $texto;

    /**
     * @ORM\Column(type="datetime")
     * @var \DateTime
     */
    private $fechaHora;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Usuario", inversedBy="mensajes")
     * @var Usuario
     */
    private $usuario;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Partida", inversedBy="mensajes")
     * @var Partida
     */
    private $partida;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getTexto()
    {
        return $this->texto;
    }

    /**
     * @param string $texto
     * @return Mensaje
     */
    public function setTexto($texto)
    {
        $this->texto = $texto;
        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getFechaHora()
    {
        return $this->fechaHora;
    }

    /**
     * @param \DateTime $fechaHora
     * @return Mensaje
     */
    public function setFechaHora($fechaHora)
    {
        $this->fechaHora = $fechaHora;
        return $this;
    }

    /**
     * @return Usuario
     */
    public function getUsuario()
    {
        return $this->usuario;
    }

    /**
     * @param Usuario $usuario
     * @return Mensaje
     */
    public function setUsuario($usuario)
    {
        $this->usuario = $usuario;
        return $this;
    }

    /**
     * @return Partida
     */
    public function getPartida()
    {
        return $this->partida;
    }

    /**
     * @param Partida $partida
     * @return Mensaje
     */
    public function setPartida($partida)
    {
        $this->partida = $partida;
        return $this;
    }
}
