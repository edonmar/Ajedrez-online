<?php

namespace AppBundle\Repository;

use AppBundle\Entity\Mensaje;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

class MensajeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Mensaje::class);
    }

    public function findSinPartida()
    {
        return $this->createQueryBuilder('m')
            ->where('m.partida is NULL')
            ->getQuery()
            ->getResult();
    }
}
