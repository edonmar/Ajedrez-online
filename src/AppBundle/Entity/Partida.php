<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity
 * @ORM\Table(name="partida")
 */
class Partida
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     * @var int
     */
    private $id;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @var int
     */
    private $jugadorAnfitrion;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @var int
     */
    private $jugadorInvitado;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     * @var bool
     */
    private $jugadorBlancas;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @var int
     */
    private $numMovimientos;

    /**
     * @ORM\Column(type="text", nullable=true)
     * @var string
     */
    private $pgn;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @var string
     */
    private $resultado;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @var \DateTime
     */
    private $fechaInicio;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @var \DateTime
     */
    private $fechaFin;

    /**
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\Usuario")
     * @var Usuario[]
     */
    private $usuarios;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Tablero", mappedBy="partida")
     * @var Tablero[]
     */
    private $tableros;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Mensaje", mappedBy="partida")
     * @var Mensaje[]
     */
    private $mensajes;

    /**
     * Partida constructor.
     */
    public function __construct()
    {
        $this->tableros = new ArrayCollection();
        $this->mensajes = new ArrayCollection();
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getJugadorAnfitrion()
    {
        return $this->jugadorAnfitrion;
    }

    /**
     * @param int $jugadorAnfitrion
     * @return Partida
     */
    public function setJugadorAnfitrion($jugadorAnfitrion)
    {
        $this->jugadorAnfitrion = $jugadorAnfitrion;
        return $this;
    }

    /**
     * @return int
     */
    public function getJugadorInvitado()
    {
        return $this->jugadorInvitado;
    }

    /**
     * @param int $jugadorInvitado
     * @return Partida
     */
    public function setJugadorInvitado($jugadorInvitado)
    {
        $this->jugadorInvitado = $jugadorInvitado;
        return $this;
    }

    /**
     * @return bool
     */
    public function isJugadorBlancas()
    {
        return $this->jugadorBlancas;
    }

    /**
     * @param bool $jugadorBlancas
     * @return Partida
     */
    public function setJugadorBlancas($jugadorBlancas)
    {
        $this->jugadorBlancas = $jugadorBlancas;
        return $this;
    }

    /**
     * @return int
     */
    public function getNumMovimientos()
    {
        return $this->numMovimientos;
    }

    /**
     * @param int $numMovimientos
     * @return Partida
     */
    public function setNumMovimientos($numMovimientos)
    {
        $this->numMovimientos = $numMovimientos;
        return $this;
    }

    /**
     * @return string
     */
    public function getPgn()
    {
        return $this->pgn;
    }

    /**
     * @param string $pgn
     * @return Partida
     */
    public function setPgn($pgn)
    {
        $this->pgn = $pgn;
        return $this;
    }

    /**
     * @return string
     */
    public function getResultado()
    {
        return $this->resultado;
    }

    /**
     * @param string $resultado
     * @return Partida
     */
    public function setResultado($resultado)
    {
        $this->resultado = $resultado;
        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getFechaInicio()
    {
        return $this->fechaInicio;
    }

    /**
     * @param \DateTime $fechaInicio
     * @return Partida
     */
    public function setFechaInicio($fechaInicio)
    {
        $this->fechaInicio = $fechaInicio;
        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getFechaFin()
    {
        return $this->fechaFin;
    }

    /**
     * @param \DateTime $fechaFin
     * @return Partida
     */
    public function setFechaFin($fechaFin)
    {
        $this->fechaFin = $fechaFin;
        return $this;
    }

    /**
     * @return Usuario[]
     */
    public function getUsuarios()
    {
        return $this->usuarios;
    }

    /**
     * @param Usuario[] $usuarios
     * @return Partida
     */
    public function setUsuarios($usuarios)
    {
        $this->usuarios = $usuarios;
        return $this;
    }

    /**
     * @return Tablero[]
     */
    public function getTableros()
    {
        return $this->tableros;
    }

    /**
     * @param Tablero[] $tableros
     * @return Partida
     */
    public function setTableros($tableros)
    {
        $this->tableros = $tableros;
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
     * @return Partida
     */
    public function setMensajes($mensajes)
    {
        $this->mensajes = $mensajes;
        return $this;
    }
}
