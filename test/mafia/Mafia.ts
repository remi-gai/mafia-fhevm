import { expect } from "chai";
import { ethers } from "hardhat";

import { getInstance } from "../instance";
import type { Signers } from "../types";
import { deployMafiaFixture } from "./Mafia.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.alice = signers[1];
    this.signers.bob = signers[2];
    this.signers.carol = signers[3];
    this.signers.dave = signers[4];
    this.signers.eve = signers[5];
    this.signers.frank = signers[6];

    const amountToSend = "1000000000";

    await this.signers.admin.sendTransaction({
      to: this.signers.alice,
      value: amountToSend,
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.bob,
      value: amountToSend,
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.carol,
      value: amountToSend,
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.dave,
      value: amountToSend,
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.eve,
      value: amountToSend,
    });
    await this.signers.admin.sendTransaction({
      to: this.signers.frank,
      value: amountToSend,
    });
  });

  describe("Mafia", function () {
    this.beforeEach(async function () {
      const contract = await deployMafiaFixture();
      this.contractAddress = await contract.getAddress();
      console.log("contractAddress: ", this.contractAddress);
      this.mafia = contract;
      const fhevmjs = await getInstance(this.contractAddress, ethers);
      this.fhevmjs = fhevmjs;
    });

    it("3 players should join the game", async function () {
      const transaction1 = await this.mafia.connect(this.signers.alice).joinGame();
      const transaction2 = await this.mafia.connect(this.signers.bob).joinGame();
      const transaction3 = await this.mafia.connect(this.signers.carol).joinGame();

      const transactionReceipt = await transaction3.wait();
      await expect(transactionReceipt)
        .to.emit(this.mafia, "JoinGame")
        .withArgs(this.signers.carol.address, [
          this.signers.alice.address,
          this.signers.bob.address,
          this.signers.carol.address,
        ]);

      // const encryptedAmount = this.fhevmjs.encrypt32(1000);
      // const transaction = await this.erc20.mint(encryptedAmount);
      // await transaction.wait();
      // // Call the method
      // const token = this.fhevmjs.getTokenSignature(this.contractAddress) || { signature: "", publicKey: "" };
      // const encryptedBalance = await this.erc20.balanceOf(token.publicKey, token.signature);
      // // Decrypt the balance
      // const balance = this.fhevmjs.decrypt(this.contractAddress, encryptedBalance);
      // expect(balance).to.equal(1000);
    });
  });
});
