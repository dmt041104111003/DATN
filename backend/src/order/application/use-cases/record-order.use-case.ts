import { Inject, Injectable } from "@nestjs/common";
import {
  ORDER_REPOSITORY,
  OrderRecordParams,
  OrderRepositoryPort,
} from "../../domain/order.repository";

@Injectable()
export class RecordOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepositoryPort
  ) {}

  execute(params: OrderRecordParams): Promise<{ id: number }> {
    return this.repository.upsertDeliveryOrder(params);
  }
}

