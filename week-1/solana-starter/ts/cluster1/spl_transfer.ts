import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("CtKveLuWT5NkjqNPzYybcaXsRuYyVMPFfMTETbh5352i");

// Recipient address
const to = new PublicKey("FTkbsUeyRujk5d47bhUzCqUzUuaMiP8LQbVNFWty9E6K");

const token_decimals = 1_000_000n;

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const signature = await transfer(
            connection,
            keypair,
            fromTokenAccount.address,
            toTokenAccount.address,
            keypair.publicKey,
            10n * token_decimals,
        )

        console.log(`Transfer success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
        // https://explorer.solana.com/tx/3M2HjbYz7XNqR9A9H2XgHSFS99CkwbtHFedMG6uaAJvuKnswDeKba5RPD2QAPd7MXAxhTeM42Sg5VBbbYwNpG6TF?cluster=devnet
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();