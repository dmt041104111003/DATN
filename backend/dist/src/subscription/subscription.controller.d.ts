import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findAll(user: {
        id: string;
    }): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateSubscriptionDto): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateSubscriptionDto): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
