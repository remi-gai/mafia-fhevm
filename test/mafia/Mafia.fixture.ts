import { ethers } from "hardhat";

import type { Mafia } from "../../types/contracts/Mafia";

export async function deployMafiaFixture(): Promise<Mafia> {
  const signers = await ethers.getSigners();
  const admin = signers[0];

  const contractFactory = await ethers.getContractFactory("Mafia");
  const contract = await contractFactory.connect(admin).deploy();
  await contract.waitForDeployment();

  return contract;
}
