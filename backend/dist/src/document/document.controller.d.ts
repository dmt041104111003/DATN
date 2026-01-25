import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    findAll(): Promise<string | {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateDocumentDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateDocumentDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
