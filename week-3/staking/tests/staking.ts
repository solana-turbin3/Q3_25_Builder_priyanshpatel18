import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { Staking } from "../target/types/staking";

describe("staking", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Staking as Program<Staking>;
  const provider = anchor.getProvider();
  const connection = provider.connection;

  // Test accounts
  let admin: Keypair;
  let user: Keypair;
  let nftMint: PublicKey;
  let userNftAta: PublicKey;

  // PDAs
  let configPda: PublicKey;
  let rewardMintPda: PublicKey;
  let userAccountPda: PublicKey;
  let vaultAta: PublicKey;
  let stakeAccountPda: PublicKey;

  // Test parameters
  const POINTS_PER_STAKE = 10;
  const MAX_UNSTAKE = 5;
  const FREEZE_PERIOD = 10; // 10 seconds for testing

  before(async () => {
    // Initialize keypairs
    admin = provider.wallet.payer;
    user = Keypair.generate();

    // Transfer 2 SOL from admin to user
    const transferTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: user.publicKey,
        lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(transferTx);

    // Create NFT mint
    nftMint = await createMint(
      connection,
      admin,
      admin.publicKey,
      null,
      0 // NFTs have 0 decimals
    );

    // Create user's NFT token account and mint 1 NFT
    userNftAta = await createAssociatedTokenAccount(
      connection,
      admin,
      nftMint,
      user.publicKey
    );

    await mintTo(
      connection,
      admin,
      nftMint,
      userNftAta,
      admin.publicKey,
      1
    );

    // Derive PDAs
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [rewardMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), configPda.toBuffer()],
      program.programId
    );

    [userAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    [vaultAta] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), nftMint.toBuffer()],
      program.programId
    );

    [stakeAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake"), user.publicKey.toBuffer(), nftMint.toBuffer()],
      program.programId
    );
  });

  it("Should initialize config successfully", async () => {
    const tx = await program.methods
      .initializeConfig(POINTS_PER_STAKE, MAX_UNSTAKE, FREEZE_PERIOD)
      .accounts({
        admin: admin.publicKey,
        config: configPda,
        rewardMint: rewardMintPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([admin])
      .rpc();

    console.log("Initialize config transaction:", tx);

    // Verify config account was created with correct data
    const configAccount = await program.account.stakeConfig.fetch(configPda);
    expect(configAccount.pointsPerStake).to.equal(POINTS_PER_STAKE);
    expect(configAccount.maxUnstake).to.equal(MAX_UNSTAKE);
    expect(configAccount.freezePeriod).to.equal(FREEZE_PERIOD);
  });

  it("Should initialize user account successfully", async () => {
    const tx = await program.methods
      .initializeUser()
      .accounts({
        user: user.publicKey,
        userAccount: userAccountPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Initialize user transaction:", tx);

    // Verify user account was created with correct initial values
    const userAccount = await program.account.userAccount.fetch(userAccountPda);
    expect(userAccount.points).to.equal(0);
    expect(userAccount.amountStaked).to.equal(0);
  });

  it("Should stake NFT successfully", async () => {
    const tx = await program.methods
      .stake()
      .accounts({
        user: user.publicKey,
        userAccount: userAccountPda,
        config: configPda,
        nftMint: nftMint,
        userNftAta: userNftAta,
        vaultAta: vaultAta,
        stakeAccount: stakeAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([user])
      .rpc();

    console.log("Stake transaction:", tx);

    // Verify stake account was created
    const stakeAccount = await program.account.stakeAccount.fetch(stakeAccountPda);
    expect(stakeAccount.owner.toString()).to.equal(user.publicKey.toString());
    expect(stakeAccount.mint.toString()).to.equal(nftMint.toString());
    expect(stakeAccount.stakeAt.toNumber()).to.be.greaterThan(0);

    // Verify user account was updated
    const userAccount = await program.account.userAccount.fetch(userAccountPda);
    expect(userAccount.points).to.equal(POINTS_PER_STAKE);
    expect(userAccount.amountStaked).to.equal(1);

    // Verify NFT was transferred to vault
    const vaultTokenAccount = await connection.getTokenAccountBalance(vaultAta);
    expect(vaultTokenAccount.value.uiAmount).to.equal(1);

    const userTokenAccount = await connection.getTokenAccountBalance(userNftAta);
    expect(userTokenAccount.value.uiAmount).to.equal(0);
  });

  it("Should fail if freeze period hasn't passed", async () => {
    try {
      await program.methods
        .unstake()
        .accounts({
          user: user.publicKey,
          userAccount: userAccountPda,
          config: configPda,
          nftMint: nftMint,
          stakeAccount: stakeAccountPda,
          vaultAta: vaultAta,
          userNftAta: userNftAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user])
        .rpc();

      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error.message).to.include("NotFrozen");
    }
  });

  it("Should unstake NFT successfully after freeze period", async () => {
    // Wait for freeze period to pass
    console.log("Waiting for freeze period...");
    await new Promise(resolve => setTimeout(resolve, (FREEZE_PERIOD + 1) * 1000));

    const tx = await program.methods
      .unstake()
      .accounts({
        user: user.publicKey,
        userAccount: userAccountPda,
        config: configPda,
        nftMint: nftMint,
        stakeAccount: stakeAccountPda,
        vaultAta: vaultAta,
        userNftAta: userNftAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([user])
      .rpc();

    console.log("Unstake transaction:", tx);

    // Verify user account was updated
    const userAccount = await program.account.userAccount.fetch(userAccountPda);
    expect(userAccount.amountStaked).to.equal(0);

    // Verify NFT was returned to user
    const userTokenAccount = await connection.getTokenAccountBalance(userNftAta);
    expect(userTokenAccount.value.uiAmount).to.equal(1);

    const vaultTokenAccount = await connection.getTokenAccountBalance(vaultAta);
    expect(vaultTokenAccount.value.uiAmount).to.equal(0);

    // Verify stake account was closed
    try {
      await program.account.stakeAccount.fetch(stakeAccountPda);
      expect.fail("Stake account should be closed");
    } catch (error) {
      expect(error.message).to.include("Account does not exist");
    }
  });
});
