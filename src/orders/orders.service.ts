import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
              console.log(`price: + ${dishFinalPrice}`);
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                  console.log(`price: + ${dishFinalPrice}`);
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;
        console.log(orderFinalPrice);

        const orderItem = await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );

        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders = [];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user },
          relations: ['items'],
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user },
          relations: ['items'],
        });
      } else if (user.role === UserRole.Owner) {
        // Owner가 restaurant을 여러개 가질 수 있음
        const restaurants = await this.restaurants.find({
          where: { owner: user },
          relations: ['orders'],
        });

        console.log(restaurants);
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
      }

      return {
        ok: true,
        orders,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not load orders',
      };
    }
  }

  async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({ id }, { relations: ['items'] });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      return {
        ok: true,
        order,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not load order',
      };
    }
  }
}
