import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: true })
  @IsBoolean()
  @IsOptional()
  isVegan: boolean;

  @Field(() => String, { defaultValue: 'test address' })
  @Column()
  @IsString()
  address: string;

  // @Field(() => String)
  // @Column()
  // @IsString()
  // ownerName: string;

  // @Field(() => String)
  // @Column()
  // @IsString()
  // categoryName: string;
}
