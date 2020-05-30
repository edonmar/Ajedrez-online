<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="anotaciones")
 */
class Anotaciones
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     * @var int
     */
    private $id;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @var string
     */
    private $texto;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     * @var bool
     */
    private $esDestacada;

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
     * @return Anotaciones
     */
    public function setTexto($texto)
    {
        $this->texto = $texto;
        return $this;
    }

    /**
     * @return bool
     */
    public function isEsDestacada()
    {
        return $this->esDestacada;
    }

    /**
     * @param bool $esDestacada
     * @return Anotaciones
     */
    public function setEsDestacada($esDestacada)
    {
        $this->esDestacada = $esDestacada;
        return $this;
    }
}
