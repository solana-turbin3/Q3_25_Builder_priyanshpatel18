import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorEscrow } from "../target/types/anchor_escrow";
import * as spl from "@solana/spl-token"
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

describe("anchor-escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider()

  const connection = provider.connection;

  const program = anchor.workspace.anchorEscrow as Program<AnchorEscrow>;
  const programId = program.programId;
  const tokenProgram = spl.TOKEN_2022_PROGRAM_ID;

  // Test Constants
  const SEED = new anchor.BN(1);
  
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block
    });
    return signature
  }

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  }

  const [maker, taker, mintA, mintB] = Array.from(
    { length: 4 },
    () => Keypair.generate()
  );

  const [makerAtaA, makerAtaB, takerAtaA, takerAtaB] = [maker, taker]
    .map((a) =>
      [mintA, mintB].map((m) =>
        spl.getAssociatedTokenAddressSync(
          m.publicKey,
          a.publicKey,
          false,
          tokenProgram
        )
      )
    )
    .flat();

  const [escrowPda, _] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      SEED.toArrayLike(Buffer, "le", 8)
    ],
    programId
  );

  const vault = spl.getAssociatedTokenAddressSync(
    mintA.publicKey,
    escrowPda,
    true,
    tokenProgram
  )

  const accounts = {
    maker: maker.publicKey,
    taker: taker.publicKey,
    mintA: mintA.publicKey,
    mintB: mintB.publicKey,
    makerAtaA,
    makerAtaB,
    takerAtaA,
    takerAtaB,
    escrow: escrowPda,
    vault,
    tokenProgram
  }

  it("Airdrop & create mint", async () => {
    let lamports = await spl.getMinimumBalanceForRentExemptMint(connection as any);
    let tx = new anchor.web3.Transaction();

    // airdrop a few sol to maker and taker
    tx.instructions = [
      ...[maker, taker].map((a) =>
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: a.publicKey,
          lamports: 1 * LAMPORTS_PER_SOL
        })
      ),

      // create mintA and mintB
      ...[mintA, mintB].map((m) =>
        SystemProgram.createAccount({
          fromPubkey: provider.publicKey,
          newAccountPubkey: m.publicKey,
          lamports,
          space: spl.MINT_SIZE,
          programId: tokenProgram
        })),

      ...[
        { mint: mintA.publicKey, authority: maker.publicKey, ata: makerAtaA },
        { mint: mintB.publicKey, authority: taker.publicKey, ata: takerAtaB },
      ].flatMap((x) => [
        spl.createInitializeMint2Instruction(
          x.mint,
          6,
          x.authority,
          null,
          tokenProgram
        ),

        spl.createAssociatedTokenAccountIdempotentInstruction(
          provider.publicKey,
          x.ata,
          x.authority,
          x.mint,
          tokenProgram
        ),

        spl.createMintToInstruction(
          x.mint,
          x.ata,
          x.authority,
          1e9,
          undefined,
          tokenProgram
        ),
      ]),
    ];

    await provider.sendAndConfirm(tx, [maker, taker, mintA, mintB]).then(log);
  });

  it("Make", async () => {
    await program.methods
      .make(SEED, new anchor.BN(1e6), new anchor.BN(1e6))
      .accounts({ ...accounts })
      .signers([maker]) // signer is req here because maker is supposed to sign this tx else the provider wallet will sign the tx
      .rpc()
      .then(confirm)
      .then(log)
  })

  xit("Refund", async () => {
    await program.methods
      .refund()
      .accounts({ ...accounts })
      .signers([maker]) // signer is req here because maker is supposed to sign this tx else the provider wallet will sign the tx
      .rpc()
      .then(confirm)
      .then(log)
  })

  it("Take", async () => {
    await program.methods
      .take()
      .accounts({ ...accounts })
      .signers([taker]) // signer is req here because taker is supposed to sign this tx else the provider wallet will sign the tx
      .rpc()
      .then(confirm)
      .then(log)
  })
});