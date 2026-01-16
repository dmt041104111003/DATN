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
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    })[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    create(user: {
        id: string;
    }, dto: CreateSubscriptionDto): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateSubscriptionDto): Promise<{
        service: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            maxProducts: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        servicePlanId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
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
