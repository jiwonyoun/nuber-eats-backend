import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  @IsString()
  name: string;

  @IsBoolean()
  @Field(() => Boolean)
  isVegan: boolean;

  @IsString()
  @Field(() => String)
  address: string;

  @IsString()
  @Length(5, 10) // Length(min, max) 문자열 길이 검사
  @Field(() => String)
  ownerName: string;
}
