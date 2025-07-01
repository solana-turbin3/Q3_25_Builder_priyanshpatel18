import {
  Transaction,
  SystemProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";

// Load sender Keypair from local JSON file
const from = Keypair.fromSecretKey(new Uint8Array(wallet));

// Define recipient (Turbin3's) public key
const to = new PublicKey("8gm5X1Nq8f28qu5XPTXk236FVmEufFprFmceRssYzMuk");

// Connect to Solana devnet
const connection = new Connection("https://api.devnet.solana.com");

(async () => {
  try {
    // Create transaction to transfer 0.01 SOL (1/1-0 of a SOL)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: LAMPORTS_PER_SOL / 100, // 0.01 SOL
      })
    );

    // Set blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = from.publicKey;

    // Sign and send transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);

    console.log("Success! View your transaction:");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error("Error during transfer:", e);
  }
})();

// https://explorer.solana.com/tx/4yHGQ3UVawXoMzpwD3ex3r2H8p6LCbgP6FoAffeYaJSkrGtpqE2L3c26BDiJxKpr4tbB3qGBuUuKcTLVABuFf1pJ?cluster=devnet

(async () => {
  try {
    // Get wallet balance
    const balance = await connection.getBalance(from.publicKey);
    console.log(`Current balance: ${balance} lamports`);

    // Create dummy transaction to estimate fees
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: balance,
      })
    );
    transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
    transaction.feePayer = from.publicKey;

    // Calculate exact transaction fee
    const fee = (
      await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')
    ).value || 0;

    console.log(`Estimated fee: ${fee} lamports`);

    // Create final transaction with adjusted amount
    transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: balance - fee,
      })
    );
    transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
    transaction.feePayer = from.publicKey;

    // Sign, send, and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);

    console.log("Success! View your transaction:");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error("Oops, something went wrong:", e);
  }
})();

// https://explorer.solana.com/tx/4WbeheV9od5eWh1sfjDsLQ9xJyUKiZSwSmmj71hsXmGZsk7vjhgPuEbqPn4MZfX88rBHPCXBvgxKBYEgMqoDr75S?cluster=devnet