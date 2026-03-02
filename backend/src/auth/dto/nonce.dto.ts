import { IsDefined } from "class-validator";
import { StakeAddressInputDto } from "./stake-address.dto";

export class NonceRequestDto extends StakeAddressInputDto {
  @IsDefined()
  declare stakeAddress: StakeAddressInputDto["stakeAddress"];
}

