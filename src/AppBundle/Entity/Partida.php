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
     * @ORM\Column(type="boolean", nullable=true)
     * @var bool
     */
    private $anfitrionEsBlancas;

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
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Usuario", inversedBy="partidasAnfitrion")
     * @var Usuario
     */
    private $jugadorAnfitrion;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Usuario", inversedBy="partidasInvitado")
     * @var Usuario
     */
    private $jugadorInvitado;

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
     * @return bool
     */
    public function isAnfitrionEsBlancas()
    {
        return $this->anfitrionEsBlancas;
    }

    /**
     * @param bool $anfitrionEsBlancas
     * @return Partida
     */
    public function setAnfitrionEsBlancas($anfitrionEsBlancas)
    {
        $this->anfitrionEsBlancas = $anfitrionEsBlancas;
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
     * @return Usuario
     */
    public function getJugadorAnfitrion()
    {
        return $this->jugadorAnfitrion;
    }

    /**
     * @param Usuario $jugadorAnfitrion
     * @return Partida
     */
    public function setJugadorAnfitrion($jugadorAnfitrion)
    {
        $this->jugadorAnfitrion = $jugadorAnfitrion;
        return $this;
    }

    /**
     * @return Usuario
     */
    public function getJugadorInvitado()
    {
        return $this->jugadorInvitado;
    }

    /**
     * @param Usuario $jugadorInvitado
     * @return Partida
     */
    public function setJugadorInvitado($jugadorInvitado)
    {
        $this->jugadorInvitado = $jugadorInvitado;
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
