<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;

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
     * @ORM\Column(type="string")
     * @var string
     */
    private $nombre;

    /**
     * @ORM\Column(type="string")
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
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Mensaje", mappedBy="usuario")
     * @var Mensaje[]
     */
    private $mensajes;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Anotacion", mappedBy="usuario")
     * @var Anotacion[]
     */
    private $anotaciones;

    /**
     * Usuario constructor.
     */
    public function __construct()
    {
        $this->mensajes = new ArrayCollection();
        $this->anotaciones = new ArrayCollection();
        $this->partidas = new ArrayCollection();
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

    /**
     * @return Anotacion[]
     */
    public function getAnotaciones()
    {
        return $this->anotaciones;
    }

    /**
     * @param Anotacion[] $anotaciones
     * @return Usuario
     */
    public function setAnotaciones($anotaciones)
    {
        $this->anotaciones = $anotaciones;
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
