"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryNonceStore = void 0;
const common_1 = require("@nestjs/common");
let InMemoryNonceStore = class InMemoryNonceStore {
    constructor() {
        this.store = new Map();
    }
    set(address, nonce) {
        this.store.set(address, nonce);
    }
    get(address) {
        return this.store.get(address);
    }
    delete(address) {
        this.store.delete(address);
    }
};
exports.InMemoryNonceStore = InMemoryNonceStore;
exports.InMemoryNonceStore = InMemoryNonceStore = __decorate([
    (0, common_1.Injectable)()
], InMemoryNonceStore);
//# sourceMappingURL=in-memory-nonce.store.js.map