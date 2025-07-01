import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { IDL } from "./programs/Turbin3_prereq";
import wallet from "./Turbin3-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

const program = new Program(IDL, provider);

const [accountKey] = PublicKey.findProgramAddressSync(
  [Buffer.from("prereqs"), keypair.publicKey.toBuffer()],
  program.programId
);

const mintTs = Keypair.generate();

const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const SYSTEM_PROGRAM_ID = SystemProgram.programId;
const MINT_COLLECTION = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

async function initialize(githubUsername: string) {
  try {
    const tx = await program.methods
      .initialize(githubUsername)
      .accounts({
        user: keypair.publicKey,
        account: accountKey,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();

    console.log("Success! Check out your TX here:");
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (err) {
    console.error("Initialize error:", err);
  }
}

async function submitTs() {
  try {
    const tx = await program.methods
      .submitTs()
      .accounts({
        user: keypair.publicKey,
        account: accountKey,
        mint: mintTs.publicKey,
        collection: MINT_COLLECTION,
        authority: keypair.publicKey,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([keypair, mintTs])
      .rpc();

    console.log("Success! Check out your TX here:");
    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (err) {
    console.error("submitTs error:", err);
  }
}

(async () => {
  // await initialize("priyanshpatel18");
  // https://explorer.solana.com/tx/3D3LvNVkEwEqtXMT1PtGPcGMv7huouEPZrR9MYsmuKyCbecKDyRNJ4deYjeB1XxBWnjVrFf6CpjyA3pFhMEhFjnW?cluster=devnet
  await submitTs(); 
  // https://explorer.solana.com/tx/5QeEUj4ncn5TstVMe9P2yfvZpiHgejSTzv83Vkogwnp8rdVtty7E5ktP7Ps2QUxvaT82uHf1MFTvKwksWWnBSPRJ?cluster=devnet
})();
