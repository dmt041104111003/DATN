import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    findAll(): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateFeedbackDto): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateFeedbackDto): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        userId: string;
        productId: string;
        content: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
