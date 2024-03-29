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
import { User } from 'src/users/user.entity';
import { Sub } from 'src/subs/sub.entity';
import { Point } from 'geojson';
import * as Enums from '../enums';
import { Role } from 'src/roles/role.entity';
import { Vote } from 'src/votes/vote.entity';
import { findDefaultWeight } from 'src/utils';
import { Twig } from 'src/twigs/twig.entity';
import { Sheaf } from 'src/sheafs/sheaf.entity';

@Entity()
export class Arrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routeName: string;

  @Column({ nullable: true })
  draft: string;

  @Column({ default: '' })
  text: string;

  @Column({ nullable: true })
  title: string;

  @Index()
  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  faviconUrl: string;
  

  @Column({ default: '#000000' })
  color: string;


  @Column({ default: 1 })
  clicks: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ default: findDefaultWeight(1, 0) })
  weight: number;



  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;


  @Column({ nullable: true })
  sourceId: string;

  @ManyToOne(() => Arrow, { nullable: true })
  @JoinColumn({ name: 'sourceId', referencedColumnName: 'id' })
  source: Arrow;

  @Column({ nullable: true })
  targetId: string;
  
  @ManyToOne(() => Arrow, { nullable: true })
  @JoinColumn({ name: 'targetId', referencedColumnName: 'id' })
  target: Arrow;


  @Column()
  sheafId: string;

  @ManyToOne(() => Sheaf)
  @JoinColumn({ name: 'sheafId', referencedColumnName: 'id' })
  sheaf: Sheaf;
  

  @OneToMany(() => Arrow, arrow => arrow.target)
  ins: Arrow[];

  @OneToMany(() => Arrow, arrow => arrow.source)
  outs: Arrow[];
  
  @Column({ default: 0 })
  inCount: number;

  @Column({ default: 0 })
  outCount: number;


  @Column()
  abstractId: string;

  @ManyToOne(() => Arrow)
  @JoinColumn({ name: 'abstractId', referencedColumnName: 'id' })
  abstract: Arrow;

  @OneToMany(() => Arrow, arrow => arrow.abstract)
  details: Arrow[];

  @OneToMany(() => Twig, twig => twig.abstract)
  twigs: Twig[];

  @Column({ default: 0 })
  twigN: number;

  @Column({ default: 0})
  twigZ: number;

  @Column({ nullable: true })
  rootTwigId: string;


  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.OTHER,
  })
  canEdit: Enums.RoleType;

  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.OTHER,
  })
  canPost: Enums.RoleType;
  
  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.OTHER,
  })
  canTalk: Enums.RoleType;  
  
  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.OTHER,
  })
  canHear: Enums.RoleType;

  @Column({
    type: 'enum',
    enum: Enums.RoleType,
    default: Enums.RoleType.OTHER,
  })
  canView: Enums.RoleType;


  @OneToMany(() => Sub, sub => sub.arrow)
  subs: Sub[];

  @OneToMany(() => Role, role => role.arrow)
  roles: Role[];
  
  @OneToMany(() => Vote, vote => vote.arrow)
  votes: Vote[];
  

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  location: Point;

  @Column('double precision', { nullable: true })
  lng: number;

  @Column('double precision', { nullable: true })
  lat: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;


  @Column({ default: false })
  isOpaque: boolean;


  @Column({ default: 'NOW()' })
  activeDate: Date;

  @Column({ default: 'NOW()' })
  saveDate: Date;
  
  @Column({ nullable: true })
  commitDate: Date;

  @Column({ nullable: true })
  removeDate: Date;

  @CreateDateColumn()
  createDate: Date;
  
  @UpdateDateColumn() 
  updateDate: Date;

  @DeleteDateColumn()
  deleteDate: Date;
}