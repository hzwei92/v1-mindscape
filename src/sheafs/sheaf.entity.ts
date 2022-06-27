import { 
  Entity,
  Column,
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { findDefaultWeight } from 'src/utils';
import { Arrow } from 'src/arrows/arrow.entity';

@Entity()
export class Sheaf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeName: string;

  
  @Column({ default: 1 })
  clicks: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ default: findDefaultWeight(1, 0) })
  weight: number;


  @Column()
  sourceId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  source: Arrow;

  @Column()
  targetId: string;
  
  @ManyToOne(() => Arrow)
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  target: Arrow;


  @OneToMany(() => Arrow, arrow => arrow.sheaf)
  links: Arrow[];


  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn() 
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}