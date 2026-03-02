import {
  IsDefined,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import type { StakeAddressInput } from "../utils";

@ValidatorConstraint({ name: "IsStakeAddressInput", async: false })
export class IsStakeAddressInputConstraint
  implements ValidatorConstraintInterface
{
  validate(value: StakeAddressInput): boolean {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (value && typeof value === "object" && typeof value.address === "string") {
      const addr = value.address;
      return addr.trim().length > 0;
    }
    return false;
  }

  defaultMessage(_: ValidationArguments): string {
    return "stakeAddress must be a non-empty string or an object with a non-empty 'address' field.";
  }
}

export class StakeAddressInputDto {
  @IsDefined()
  @Validate(IsStakeAddressInputConstraint)
  stakeAddress!: StakeAddressInput;
}

