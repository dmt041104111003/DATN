import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    findAll(): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateDocumentDto): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateDocumentDto): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
