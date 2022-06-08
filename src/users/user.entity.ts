import { 
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { Point } from 'geojson';
import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ nullable: true })
  frameId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  frame: Post;

  @Column({ nullable: true })
  focusId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id'})
  focus: Post;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true, where: '"deleteDate" is not null' })
  lowercaseName: string;

  @Column()
  @Index({ unique: true, where: '"deleteDate" is not null' })
  routeName: string;

  @Column({ nullable: true })
  @Index({ unique: true })
  email: string;
  
  @Column({ default: '' })
  description: string;

  @Column()
  color: string;
  
  @Column('double precision', { nullable: true })
  mapLng: number;

  @Column('double precision', { nullable: true })
  mapLat: number;

  @Column('double precision', {nullable: true})
  mapZoom: number;

  @Column({ default: false })
  isRegisteredWithGoogle: boolean;

  @Exclude()
  @Column({ nullable: true })
  hashedPassword: string;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Exclude()
  @Column({ nullable: true })
  hashedEmailVerificationCode: string;

  @Column({ nullable: true })
  verifyEmailDate: Date;

  @Column({default: false})
  isAdmin: boolean;

  @Column({default: 'NOW()'})
  lastActiveDate: Date;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
 
  @DeleteDateColumn()
  deleteDate: Date;
}