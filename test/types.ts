import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";
import type { FhevmInstance } from "fhevmjs";

import type { Mafia } from "../types/contracts/Mafia";

declare module "mocha" {
  export interface Context {
    signers: Signers;
    contractAddress: string;
    fhevmjs: FhevmInstance;
    mafia: Mafia;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  dave: SignerWithAddress;
  eve: SignerWithAddress;
  frank: SignerWithAddress;
}
