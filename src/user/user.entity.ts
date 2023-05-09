import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  hashedPassword: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'bytea', nullable: true })
  pdf: Buffer;
}
