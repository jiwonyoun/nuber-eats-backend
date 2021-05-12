import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrderInput {
  @Field(() => Number)
  id: number;
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
