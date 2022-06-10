import { 
  Entity,
  Tree,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
@Tree('closure-table', {
  closureTableName: 'twig',
  ancestorColumnName: () => 'ancestorId',
  descendantColumnName: () => 'descendantId'
})
export class Twig {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column()
  abstractId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' })
  abstract: Arrow;

  @Column()
  detailId: string;
  
  @ManyToOne(() => Arrow)
  @JoinColumn({ referencedColumnName: 'id' })
  detail: Arrow;

  @TreeParent()
  parent: Twig;

  @TreeChildren()
  children: Twig[];

  @Column({ default: 0 })
  i: number;

  @Column({ default: 0 })
  x: number;

  @Column({ default: 0})
  y: number;

  @Column({ default: 0})
  z: number;

  @Column({ default: true })
  isPinned: boolean;
  
  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}