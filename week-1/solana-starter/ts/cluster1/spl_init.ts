import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Start here
        const mint = await createMint(
            connection,
            keypair,
            keypair.publicKey,
            null,
            9
        );
        console.log(`Success! Checkout mint: https://explorer.solana.com/address/${mint}?cluster=devnet`);
        // https://explorer.solana.com/address/CtKveLuWT5NkjqNPzYybcaXsRuYyVMPFfMTETbh5352i?cluster=devnet
    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
