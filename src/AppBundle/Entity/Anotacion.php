<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="anotacion")
 */
class Anotacion
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
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Usuario", inversedBy="anotaciones")
     * @var Usuario
     */
    private $usuario;

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
     * @return Anotacion
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
     * @return Anotacion
     */
    public function setEsDestacada($esDestacada)
    {
        $this->esDestacada = $esDestacada;
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
     * @return Anotacion
     */
    public function setUsuario($usuario)
    {
        $this->usuario = $usuario;
        return $this;
    }
}
