import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    create(dto: CreateSubscriptionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    update(id: string, dto: UpdateSubscriptionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
}
