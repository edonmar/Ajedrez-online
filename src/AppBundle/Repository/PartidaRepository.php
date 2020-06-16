<?php

namespace AppBundle\Repository;

use AppBundle\Entity\Partida;
use AppBundle\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

class PartidaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Partida::class);
    }

    public function contarTerminadasByUsuario(Usuario $usuario)
    {
        return $this->createQueryBuilder('p')
            ->select('count(p)')
            ->where('p.jugadorAnfitrion = :usuario')
            ->orWhere('p.jugadorInvitado = :usuario')
            ->andWhere('p.fechaFin is not NULL')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findTerminadasByUsuario(Usuario $usuario)
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->where('p.jugadorAnfitrion = :usuario')
            ->orWhere('p.jugadorInvitado = :usuario')
            ->andWhere('p.fechaFin is not NULL')
            ->setParameter('usuario', $usuario)
            ->orderBy('p.fechaFin', 'desc')
            ->getQuery()
            ->getResult();
    }

    public function findInvitacionesOrdenadas(Usuario $usuario)
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->where('p.jugadorInvitado = :usuario')
            ->andWhere('p.fechaInicio is NULL')
            ->setParameter('usuario', $usuario)
            ->orderBy('p.jugadorAnfitrion', 'desc')
            ->getQuery()
            ->getResult();
    }

    public function findEnCusro(Usuario $usuario)
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->where('p.jugadorAnfitrion = :usuario')
            ->orWhere('p.jugadorInvitado = :usuario')
            ->andWhere('p.fechaInicio is not NULL')
            ->andWhere('p.fechaFin is NULL')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getResult();
    }
}
