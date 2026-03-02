import { ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import type { StakeAddressInput } from "../utils";
export declare class IsStakeAddressInputConstraint implements ValidatorConstraintInterface {
    validate(value: StakeAddressInput): boolean;
    defaultMessage(_: ValidationArguments): string;
}
export declare class StakeAddressInputDto {
    stakeAddress: StakeAddressInput;
}
