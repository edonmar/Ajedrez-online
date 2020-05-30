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
}
