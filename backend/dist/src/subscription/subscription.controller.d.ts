import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findAll(user: {
        id: string;
    }): Promise<({
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateSubscriptionDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateSubscriptionDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
        };
    } & {
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
