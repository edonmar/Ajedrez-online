<?php

namespace AppBundle\Repository;

use AppBundle\Entity\Tablero;
use AppBundle\Entity\Partida;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

class TableroRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tablero::class);
    }

    public function findUltimoByPartida(Partida $partida){
        return $this->createQueryBuilder('t')
            ->select('t')
            ->where('t.partida = :partida')
            ->setParameter('partida', $partida)
            ->orderBy('t.id', 'desc')
            ->setMaxResults(1)
            ->getQuery()
            ->getResult();
    }

    public function contarByPartida(Partida $partida){
        return $this->createQueryBuilder('t')
            ->select('count(t)')
            ->where('t.partida = :partida')
            ->setParameter('partida', $partida)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
