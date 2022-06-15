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

  @Column({ default: false })
  isRoot: boolean;
  
  @Column({ default: 0 })
  i: number;

  @Column({ default: 0 })
  x: number;

  @Column({ default: 0})
  y: number;

  @Column({ default: 0})
  z: number;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  isOpen: boolean;

  @TreeParent()
  parent: Twig;

  @TreeChildren()
  children: Twig[];

  @Column({ nullable: true })
  index: number;

  @Column({ default: 1 })
  degree: number;

  @Column({ default: 1 })
  rank: number;

  @Column({ nullable: true })
  windowId: number;

  @Column({ nullable: true })
  groupId: number;

  @Column({ nullable: true })
  tabId: number;
  
  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}