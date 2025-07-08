import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("CtKveLuWT5NkjqNPzYybcaXsRuYyVMPFfMTETbh5352i");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
            false,
            "confirmed"
        )
        console.log(`Your ata is: ${ata.address.toBase58()}`);
        // Hf8kdHNaWEQemMkmUyUB6zLa7URURXxL9n8wn6oqjpJf

        // Mint to ATA
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            ata.address,
            keypair.publicKey,
            100n * token_decimals
        )
        console.log(`Success! Check out your TX here:\nhttps://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
        // https://explorer.solana.com/tx/ab66tA3ZQfvn5bmhgaRgKrRrGA4AjY7qEKGHBgQMFTwAWoN6Ybm9rtvoTZ8bpmMYh8UaceYSwn3XyCCEpnYV54Q?cluster=devnet
    } catch (error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
