import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  totalPages?: number;

  @Field(() => Int, { nullable: true })
  totalResults?: number;
}
