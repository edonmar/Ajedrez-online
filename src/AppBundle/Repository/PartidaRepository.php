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

    public function contarPorUsuario(Usuario $usuario){
        return $this->createQueryBuilder('p')
            ->select('count(p)')
            ->innerJoin('p.usuarios', 'u')
            ->where('u.id = :usuario')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findByUsuario(Usuario $usuario)
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->innerJoin('p.usuarios', 'u')
            ->where('u.id = :usuario')
            ->setParameter('usuario', $usuario)
            ->orderBy('p.fechaFin', 'desc')
            ->getQuery()
            ->getResult();
    }
}