import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/common/common.constants';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish, DishOption } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockPubSub = () => ({
  publish: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrderService', () => {
  let service: OrderService;
  let ordersRepository: MockRepository<Order>;
  let orderItemsRepository: MockRepository<OrderItem>;
  let restaurantsRepository: MockRepository<Restaurant>;
  let dishesRepository: MockRepository<Dish>;
  let pubSub: PubSub;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository(),
        },
        {
          provide: PUB_SUB,
          useValue: mockPubSub(),
        },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
    ordersRepository = module.get(getRepositoryToken(Order));
    orderItemsRepository = module.get(getRepositoryToken(OrderItem));
    restaurantsRepository = module.get(getRepositoryToken(Restaurant));
    dishesRepository = module.get(getRepositoryToken(Dish));
    pubSub = module.get(PUB_SUB);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderArgs = {
      restaurantId: 1,
      items: [
        {
          dishId: 1,
          options: [
            {
              name: 'optionName',
              extra: 10,
            },
          ],
        },
      ],
    };

    it('should fail if restaurant not exists', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.createOrder(new User(), createOrderArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'Restaurant not found',
      });
    });

    it('should fail if dish not exists', async () => {
      restaurantsRepository.findOne.mockResolvedValue(new Restaurant());
      dishesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.createOrder(new User(), createOrderArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'Dish not found',
      });
    });

    it('should create a new order', async () => {
      restaurantsRepository.findOne.mockResolvedValue(new Restaurant());
      dishesRepository.findOne.mockResolvedValue(new Dish());
      orderItemsRepository.create.mockReturnValue(new OrderItem());
      orderItemsRepository.save.mockResolvedValue(new OrderItem());
      ordersRepository.create.mockReturnValue(createOrderArgs);
      ordersRepository.save.mockResolvedValue(createOrderArgs);

      const result = await service.createOrder(new User(), createOrderArgs);
    });
  });
});
