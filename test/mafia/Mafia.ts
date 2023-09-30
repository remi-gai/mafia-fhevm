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

    const amountToSend = "1000000000000";

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
      const transaction4 = await this.mafia.connect(this.signers.dave).joinGame();

      const transactionReceipt = await transaction4.wait();
      await expect(transactionReceipt)
        .to.emit(this.mafia, "JoinGame")
        .withArgs(this.signers.dave.address, [
          this.signers.alice.address,
          this.signers.bob.address,
          this.signers.carol.address,
          this.signers.dave.address,
        ]);

      const initializeGameTx = await this.mafia.connect(this.signers.alice).initializeGame([
        this.fhevmjs.encrypt8(1), // mafia: alice
        this.fhevmjs.encrypt8(2), // detective: bob
        this.fhevmjs.encrypt8(3), // doctor: carol
        this.fhevmjs.encrypt8(4), // citizen: dave
      ]);

      const initializeGameTxReceipt = await initializeGameTx.wait();
      await expect(initializeGameTxReceipt).to.emit(this.mafia, "NewState").withArgs(1);

      // playerId starts from 0
      const action1Tx = await this.mafia.connect(this.signers.alice).action(this.fhevmjs.encrypt8(3)); // mafia kills dave
      const action2Tx = await this.mafia.connect(this.signers.bob).action(this.fhevmjs.encrypt8(0)); // detective checks alice
      const action3Tx = await this.mafia.connect(this.signers.carol).action(this.fhevmjs.encrypt8(3)); // doctor saves dave
      const action4Tx = await this.mafia.connect(this.signers.dave).action(this.fhevmjs.encrypt8(3)); // dave takes action on dave

      this.timeout(80000);
      const action4TxReceipt = await action4Tx.wait();

      const result = await this.mafia.playerKilled();

      expect(result).to.be.equal(255); // dave is saved by doctor

      // await expect(action4TxReceipt)
      //   .to.emit(this.mafia, "Action")
      //   .withArgs(this.signers.dave.address, [
      //     this.signers.alice.address,
      //     this.signers.bob.address,
      //     this.signers.carol.address,
      //     this.signers.dave.address,
      //   ]);

      // await expect(action4TxReceipt).to.emit(this.mafia, "NewState").withArgs(2);

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
