<?php


namespace AppBundle\Form\Model;


use Symfony\Component\Validator\Constraints as Assert;

class CambioClave
{
    /**
     * @var string
     */
    private $claveAntigua;

    /**
     * @Assert\Length(min=8, max=30)
     * @var string
     */
    private $nuevaClave;

    /**
     * @return string
     */
    public function getClaveAntigua()
    {
        return $this->claveAntigua;
    }

    /**
     * @param string $claveAntigua
     * @return CambioClave
     */
    public function setClaveAntigua($claveAntigua)
    {
        $this->claveAntigua = $claveAntigua;
        return $this;
    }

    /**
     * @return string
     */
    public function getNuevaClave()
    {
        return $this->nuevaClave;
    }

    /**
     * @param string $nuevaClave
     * @return CambioClave
     */
    public function setNuevaClave($nuevaClave)
    {
        $this->nuevaClave = $nuevaClave;
        return $this;
    }
}