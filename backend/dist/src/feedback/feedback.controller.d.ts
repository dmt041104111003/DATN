import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    findAll(): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateFeedbackDto): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateFeedbackDto): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        productId: string;
        content: string;
        rating: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
