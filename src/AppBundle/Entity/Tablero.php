<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="tablero")
 */
class Tablero
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
    private $casillas;

    /**
     * @ORM\Column(type="boolean")
     * @var bool
     */
    private $turno;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @var string
     */
    private $enroques;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @var string
     */
    private $peonAlPaso;

    /**
     * @ORM\Column(type="string")
     * @var string
     */
    private $regla50mov;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @var string
     */
    private $ultimoMov;

    /**
     * @ORM\Column(type="boolean")
     * @var bool
     */
    private $jaque;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Partida", inversedBy="tableros")
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
    public function getCasillas()
    {
        return $this->casillas;
    }

    /**
     * @param string $casillas
     * @return Tablero
     */
    public function setCasillas($casillas)
    {
        $this->casillas = $casillas;
        return $this;
    }

    /**
     * @return bool
     */
    public function isTurno()
    {
        return $this->turno;
    }

    /**
     * @param bool $turno
     * @return Tablero
     */
    public function setTurno($turno)
    {
        $this->turno = $turno;
        return $this;
    }

    /**
     * @return string
     */
    public function getEnroques()
    {
        return $this->enroques;
    }

    /**
     * @param string $enroques
     * @return Tablero
     */
    public function setEnroques($enroques)
    {
        $this->enroques = $enroques;
        return $this;
    }

    /**
     * @return string
     */
    public function getPeonAlPaso()
    {
        return $this->peonAlPaso;
    }

    /**
     * @param string $peonAlPaso
     * @return Tablero
     */
    public function setPeonAlPaso($peonAlPaso)
    {
        $this->peonAlPaso = $peonAlPaso;
        return $this;
    }

    /**
     * @return string
     */
    public function getRegla50mov()
    {
        return $this->regla50mov;
    }

    /**
     * @param string $regla50mov
     * @return Tablero
     */
    public function setRegla50mov($regla50mov)
    {
        $this->regla50mov = $regla50mov;
        return $this;
    }

    /**
     * @return string
     */
    public function getUltimoMov()
    {
        return $this->ultimoMov;
    }

    /**
     * @param string $ultimoMov
     * @return Tablero
     */
    public function setUltimoMov($ultimoMov)
    {
        $this->ultimoMov = $ultimoMov;
        return $this;
    }

    /**
     * @return bool
     */
    public function isJaque()
    {
        return $this->jaque;
    }

    /**
     * @param bool $jaque
     * @return Tablero
     */
    public function setJaque($jaque)
    {
        $this->jaque = $jaque;
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
     * @return Tablero
     */
    public function setPartida($partida)
    {
        $this->partida = $partida;
        return $this;
    }
}
