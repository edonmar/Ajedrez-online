<?php

namespace AppBundle\Form\Type;

use AppBundle\Entity\Usuario;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UsuarioType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('nombre', TextType::class, [
                'label' => 'Nombre'
            ]);

        if ($options['nuevo'] === true) {
            $builder
                ->add('clave', RepeatedType::class, [
                    'type' => PasswordType::class,
                    'invalid_message' => 'Las dos contraseñas no coinciden',
                    'first_options'  => [
                        'label' => 'Contraseña'
                    ],
                    'second_options' => [
                        'label' => 'Repita la contraseña'
                    ],
                ]);
        }
        else{
            $builder
                ->add('administrador', CheckboxType::class, [
                    'label' => '¿Es administrador?',
                    'required' => false
                ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Usuario::class,
            'nuevo' => false
        ]);
    }

}