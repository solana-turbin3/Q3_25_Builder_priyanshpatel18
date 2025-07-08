import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";

describe("anchor_vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVault as Program<AnchorVault>;

  const vaultState = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
    program.programId
  )[0];

  const vault = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc()

    console.log("\nYour transaction signature", tx);
    console.log("Your vault info", await provider.connection.getAccountInfo(vault));
    // https://explorer.solana.com/tx/3tnYruG94t7bJX66L4faGSYHYnZ5QGbh6GJwD9zsiXiW1XmFC17dW5xeoLssZcRhBVXFa7WeDJ8ERofXUpZgDwyr?cluster=devnet
  });

  it("Is deposited!", async () => {
    // Add your test here.
    const tx = await program.methods
      .deposit(new anchor.BN(2 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc()

    console.log("\nYour transaction signature", tx);
    console.log("Your vault info", (await provider.connection.getBalance(vault)).toString());
    // https://explorer.solana.com/tx/3ysBu4s9bAF6VrSBHZaZYj5ZRc7G43MF9C6PaDjFQZaY8zAFs1XZzkzjQL4L8X6cRVAJRfafLisToYUT4ewkH8s3?cluster=devnet
  });

  it("Is Withdrawn!", async () => {
    // Add your test here.
    const tx = await program.methods
      .withdraw(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc()

    console.log("\nYour transaction signature", tx);
    console.log("Your vault info", (await provider.connection.getBalance(vault)).toString());
    // https://explorer.solana.com/tx/5qQGzrCV4tup6yrQwZ5YMfLYFpb6Chd4rcYKWCNMgrJfdu5NuVwEXsVEPVw2N5NSRZDc9Hh9o4vp8aDNvZiwjE68?cluster=devnet
  });

  it("Is closed!", async () => {
    // Add your test here.
    const tx = await program.methods
      .close()
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc()

    console.log("\nYour transaction signature", tx);
    console.log("Your vault info", (await provider.connection.getAccountInfo(vault)));
    // https://explorer.solana.com/tx/2Bp3u4f27ev4pRgAtqSyk6ZG4HuRwhfVB8ussd1avi38P1dZiM9E7D8E7g23ufpqF7Lnm6LEQzgXsowue9W2mqfS?cluster=devnet
  });
});
