import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    findAll(): Promise<string | {
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateDocumentDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateDocumentDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
