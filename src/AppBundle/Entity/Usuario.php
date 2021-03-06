<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ORM\Table(name="usuario")
 */
class Usuario implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     * @var int
     */
    private $id;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Assert\NotBlank()
     * @Assert\Length(min=2, max=40, minMessage="El nombre debe tener un mínimo de 2 caracteres", maxMessage="El nombre debe tener un máximo de 40 caracteres")
     * @var string
     */
    private $nombre;

    /**
     * @ORM\Column(type="string")
     * @Assert\NotBlank()
     * @Assert\Length(min=8, minMessage="La clave debe tener un mínimo de 8 caracteres")
     * @var string
     */
    private $clave;

    /**
     * @ORM\Column(type="date")
     * @var \DateTime
     */
    private $fechaRegistro;

    /**
     * @ORM\Column(type="boolean")
     * @var bool
     */
    private $administrador;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Partida", mappedBy="jugadorAnfitrion")
     * @var Partida[]
     */
    private $partidasAnfitrion;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Partida", mappedBy="jugadorInvitado")
     * @var Partida[]
     */
    private $partidasInvitado;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Mensaje", mappedBy="usuario")
     * @var Mensaje[]
     */
    private $mensajes;

    /**
     * Usuario constructor.
     */
    public function __construct()
    {
        $this->mensajes = new ArrayCollection();
        $this->partidasAnfitrion = new ArrayCollection();
        $this->partidasInvitado = new ArrayCollection();
    }

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
    public function getNombre()
    {
        return $this->nombre;
    }

    /**
     * @param string $nombre
     * @return Usuario
     */
    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
        return $this;
    }

    /**
     * @return string
     */
    public function getClave()
    {
        return $this->clave;
    }

    /**
     * @param string $clave
     * @return Usuario
     */
    public function setClave($clave)
    {
        $this->clave = $clave;
        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getFechaRegistro()
    {
        return $this->fechaRegistro;
    }

    /**
     * @param \DateTime $fechaRegistro
     * @return Usuario
     */
    public function setFechaRegistro($fechaRegistro)
    {
        $this->fechaRegistro = $fechaRegistro;
        return $this;
    }

    /**
     * @return bool
     */
    public function isAdministrador()
    {
        return $this->administrador;
    }

    /**
     * @param bool $administrador
     * @return Usuario
     */
    public function setAdministrador($administrador)
    {
        $this->administrador = $administrador;
        return $this;
    }

    /**
     * @return Partida[]
     */
    public function getPartidasAnfitrion()
    {
        return $this->partidasAnfitrion;
    }

    /**
     * @param Partida[] $partidasAnfitrion
     * @return Usuario
     */
    public function setPartidasAnfitrion($partidasAnfitrion)
    {
        $this->partidasAnfitrion = $partidasAnfitrion;
        return $this;
    }

    /**
     * @return Partida[]
     */
    public function getPartidasInvitado()
    {
        return $this->partidasInvitado;
    }

    /**
     * @param Partida[] $partidasInvitado
     * @return Usuario
     */
    public function setPartidasInvitado($partidasInvitado)
    {
        $this->partidasInvitado = $partidasInvitado;
        return $this;
    }

    /**
     * @return Mensaje[]
     */
    public function getMensajes()
    {
        return $this->mensajes;
    }

    /**
     * @param Mensaje[] $mensajes
     * @return Usuario
     */
    public function setMensajes($mensajes)
    {
        $this->mensajes = $mensajes;
        return $this;
    }

    public function __toString()
    {
        return $this->getNombre();
    }

    /**
     * @inheritDoc
     */
    public function getRoles()
    {
        $roles = ['ROLE_USER'];

        if ($this->isAdministrador())
            $roles[] = 'ROLE_ADMINISTRADOR';

        return $roles;
    }

    /**
     * @inheritDoc
     */
    public function getPassword()
    {
        return $this->getClave();
    }

    /**
     * @inheritDoc
     */
    public function getSalt()
    {
        return null;
    }

    /**
     * @inheritDoc
     */
    public function getUsername()
    {
        return $this->getNombre();
    }

    /**
     * @inheritDoc
     */
    public function eraseCredentials()
    {

    }
}
