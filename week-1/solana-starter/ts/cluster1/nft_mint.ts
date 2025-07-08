import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import base58 from "bs58";
import wallet from "../turbin3-wallet.json";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(
        umi,
        {
            mint,
            tokenOwner: myKeypairSigner.publicKey,
            name: "Jeff is King",
            symbol: "JEFF",
            uri: "https://beige-recent-peafowl-739.mypinata.cloud/ipfs/bafkreiahz3qwiccbxq5y5zkj4h7puxxfwqco7q4neezpqeha6dojxa7h7e",
            sellerFeeBasisPoints: percentAmount(0),
            creators: null,
            collection: null,
            uses: null
        }
    )
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
    // https://explorer.solana.com/tx/3h1bmxEM5fEmHZtiGeM9CEruVXv3Ry1dcUcrBakZN4dbDbMNcC4KGnH6wj8KrT9ehzKJvxWGyNXsP3C4iAAmJn9W?cluster=devnet
    console.log("Mint Address: ", mint.publicKey);
    // https://explorer.solana.com/account/a2WqyMFjx8u5Mgky1AVK6GFgmm4yZ4vN9LegH6RRadT?cluster=devnet
})();