import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
    findMetadataPda,
    updateMetadataAccountV2
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../turbin3-wallet.json";
import bs58 from "bs58";

// Define our Mint address
const mint = publicKey("CtKveLuWT5NkjqNPzYybcaXsRuYyVMPFfMTETbh5352i");

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: findMetadataPda(umi, { mint }),
            mint: mint,
            mintAuthority: signer,
            payer: signer,
            updateAuthority: signer.publicKey
        }

        let data: DataV2Args = {
            name: "Turbin3",
            symbol: "TRB",
            uri: "https://beige-recent-peafowl-739.mypinata.cloud/ipfs/bafkreihtdncdgmwyggafvm4ottv2zhe7wi4aac7skxijfywncprqih5rey/turbine_metadata.json",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(`Success! Check out your TX here:\nhttps://explorer.solana.com/tx/${bs58.encode(result.signature)}?cluster=devnet`);
        // https://explorer.solana.com/tx/xH8b9EnDp5dQp5bq4Kdf2Ghgo1kF6uvMWng53wndDPrUs7epaX193Q1QH3hCX5rA61aJgAooxKbSDqtagfmZpHB?cluster=devnet
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
});