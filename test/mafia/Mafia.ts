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

    // it("3 players should join the game", async function () {
    // tx =  await this.mafiaFactory.connect(this.signers.alice).deployGame();
    // tx.await()
    // tx.result -> gameAddress of the Mafia contract
    // Mafia = await ethers.getContractFactory("Mafia");
    // mafiaGame = await Mafia.attach(gameAddress);
    // this.mafiaGame.connect(this.signers.alice).joinGame()
    // ... rest is the same
    // });

    // TODO:
    // 1) first finish writing test for 1 night game -> make sure to handle cases in which doctor saves the player
    // 2) writing test for multi night game
    // 3) Then refactoring with the Factory pattern

    it("4 players should join the game", async function () {
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

      const generatedToken = this.fhevmjs.generateToken({
        verifyingContract: this.contractAddress,
      });
      const signature = await this.signers.bob.signTypedData(
        generatedToken.token.domain,
        { Reencrypt: generatedToken.token.types.Reencrypt },
        generatedToken.token.message,
      );
      const encryptedRole = await this.mafia.connect(this.signers.bob).viewOwnRole(generatedToken.publicKey, signature);

      // Decrypt the role
      const role = this.fhevmjs.decrypt(this.contractAddress, encryptedRole);
      expect(role).to.equal(2);

      // playerId starts from 0
      const action1Tx = await this.mafia.connect(this.signers.alice).action(this.fhevmjs.encrypt8(3)); // mafia kills dave
      const action2Tx = await this.mafia.connect(this.signers.bob).action(this.fhevmjs.encrypt8(0)); // detective checks alice
      const action3Tx = await this.mafia.connect(this.signers.carol).action(this.fhevmjs.encrypt8(3)); // doctor saves dave
      const action4Tx = await this.mafia.connect(this.signers.dave).action(this.fhevmjs.encrypt8(3)); // dave takes action on dave

      this.timeout(120000);
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

      const vote1Tx = await this.mafia.connect(this.signers.alice).castVote(2); //alice votes to kill carol
      const vote2Tx = await this.mafia.connect(this.signers.bob).castVote(0); //alice votes to kill mafia
      const vote3Tx = await this.mafia.connect(this.signers.carol).castVote(0); //alice votes to kill mafia
      const vote4Tx = await this.mafia.connect(this.signers.dave).castVote(0); //alice votes to kill mafia

      const vote4txReceipt = await vote4Tx.wait();

    });



  });
});
