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
    private $jugadorBlancas;

    /**
     * @ORM\Column(type="text", nullable=true)
     * @var string
     */
    private $movimientos;

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
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Anotacion")
     */
    private $anotacion;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Tablero", mappedBy="partida")
     * @var Tablero[]
     */
    private $tableros;

    /**
     * Partida constructor.
     */
    public function __construct()
    {
        $this->tableros = new ArrayCollection();
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
     * @return string
     */
    public function getMovimientos()
    {
        return $this->movimientos;
    }

    /**
     * @param string $movimientos
     * @return Partida
     */
    public function setMovimientos($movimientos)
    {
        $this->movimientos = $movimientos;
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
     * @return mixed
     */
    public function getAnotacion()
    {
        return $this->anotacion;
    }

    /**
     * @param mixed $anotacion
     * @return Partida
     */
    public function setAnotacion($anotacion)
    {
        $this->anotacion = $anotacion;
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
}
