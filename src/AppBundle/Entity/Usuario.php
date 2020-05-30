<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity
 * @ORM\Table(name="usuario")
 */
class Usuario
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
    private $esAdministrador;

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
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\Partida")
     * @var Partida[]
     */
    private $partidas;

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
    public function isEsAdministrador()
    {
        return $this->esAdministrador;
    }

    /**
     * @param bool $esAdministrador
     * @return Usuario
     */
    public function setEsAdministrador($esAdministrador)
    {
        $this->esAdministrador = $esAdministrador;
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

    /**
     * @return Partida[]
     */
    public function getPartidas()
    {
        return $this->partidas;
    }

    /**
     * @param Partida[] $partidas
     * @return Usuario
     */
    public function setPartidas($partidas)
    {
        $this->partidas = $partidas;
        return $this;
    }
}
