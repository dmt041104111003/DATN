"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakeAddressInputDto = exports.IsStakeAddressInputConstraint = void 0;
const class_validator_1 = require("class-validator");
let IsStakeAddressInputConstraint = class IsStakeAddressInputConstraint {
    validate(value) {
        if (typeof value === "string") {
            return value.trim().length > 0;
        }
        if (value && typeof value === "object" && typeof value.address === "string") {
            const addr = value.address;
            return addr.trim().length > 0;
        }
        return false;
    }
    defaultMessage(_) {
        return "stakeAddress must be a non-empty string or an object with a non-empty 'address' field.";
    }
};
exports.IsStakeAddressInputConstraint = IsStakeAddressInputConstraint;
exports.IsStakeAddressInputConstraint = IsStakeAddressInputConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: "IsStakeAddressInput", async: false })
], IsStakeAddressInputConstraint);
class StakeAddressInputDto {
}
exports.StakeAddressInputDto = StakeAddressInputDto;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(IsStakeAddressInputConstraint),
    __metadata("design:type", Object)
], StakeAddressInputDto.prototype, "stakeAddress", void 0);
//# sourceMappingURL=stake-address.dto.js.map