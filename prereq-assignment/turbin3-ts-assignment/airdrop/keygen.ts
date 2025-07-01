import { Keypair } from "@solana/web3.js";

// Generate a new keypair
const kp = Keypair.generate();

// Log the public key
console.log(`You've generated a new Solana wallet:\n${kp.publicKey.toBase58()}`);

// Log the secret key as JSON array (so you can save it)
console.log(`\nTo save your wallet, copy and paste the following into a JSON file:`);
console.log(JSON.stringify(Array.from(kp.secretKey)));
