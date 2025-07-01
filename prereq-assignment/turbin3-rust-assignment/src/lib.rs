use solana_client::rpc_client::RpcClient;
use solana_program::system_instruction::transfer;
use solana_sdk::{
    hash::hash,
    message::Message,
    pubkey::Pubkey,
    signature::{Keypair, Signer, read_keypair_file},
    transaction,
};
use std::{
    io::{self, BufRead},
    str::FromStr,
};

const RPC_URL: &str = "https://api.devnet.solana.com";

#[cfg(test)]
mod tests {
    use solana_sdk::transaction::Transaction;

    use super::*;

    #[test]
    fn keygen() {
        let kp = Keypair::new();
        println!("You've generated a new Solana wallet: {}", kp.pubkey());
        println!("JSON key file:\n{:?}", kp.to_bytes());
    }

    #[test]
    fn base58_to_wallet() {
        println!("Input base58 private key:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("Wallet JSON byte array:\n{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58() {
        println!("Input wallet as JSON byte array:");
        let stdin = io::stdin();
        let input = stdin.lock().lines().next().unwrap().unwrap();
        let bytes = input
            .trim_start_matches('[')
            .trim_end_matches(']')
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();
        let encoded = bs58::encode(bytes).into_string();
        println!("Base58 private key:\n{}", encoded);
    }

    #[test]
    fn claim_airdrop() {
        let keypair = read_keypair_file("dev_wallet.json").expect("No wallet found");
        let client = RpcClient::new(RPC_URL);
        let result = client.request_airdrop(&keypair.pubkey(), 2_000_000_000);
        match result {
            Ok(sig) => {
                println!("Transaction success:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
                // https://explorer.solana.com/tx/4EacdwVk4oPmuQWGWLcnbb7o93P3d543aZUYkkv8dzsJ2Gn1CU24KTLJeVbSye45FoWHCwFPujo4D4xztgxbknnA?cluster=devnet
            }
            Err(e) => println!("Airdrop failed: {}", e),
        }
    }

    #[test]
    fn transfer_sol() {
        let keypair = read_keypair_file("dev_wallet.json").expect("No wallet found");
        let pubkey = keypair.pubkey();
        let to_pubkey = Pubkey::from_str("<Turbin3 Wallet Address>").unwrap(); // ← replace this

        let msg = b"I verify my Solana Keypair!";
        let sig = keypair.sign_message(msg);
        let valid = sig.verify(&pubkey.to_bytes(), &hash(sig.as_ref()).to_bytes());
        println!("Signature verification: {}", valid);

        let client = RpcClient::new(RPC_URL);
        let blockhash = client.get_latest_blockhash().expect("Blockhash failed");

        let tx = Transaction::new_signed_with_payer(
            &[transfer(&pubkey, &to_pubkey, 1_000_000)], // 0.001 SOL
            Some(&pubkey),
            &[&keypair],
            blockhash,
        );

        let sig = client
            .send_and_confirm_transaction(&tx)
            .expect("Transaction failed");
        println!("Transaction success:");
        println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
        // https://explorer.solana.com/tx/2R7xvSfDarrJ6iqnPPXbPJ6NxWH232qpLDK12nvBVgpCffeFziTERCdh49JPzJDMF66Zb7pWGNNi2wgaWkqLcpRT?cluster=devnet
    }

    #[test]
    fn drain_wallet() {
        let keypair = read_keypair_file("dev_wallet.json").expect("No wallet found");
        let pubkey = keypair.pubkey();
        let to_pubkey = Pubkey::from_str("<Turbin3 Wallet Address>").unwrap(); // ← replace this

        let client = RpcClient::new(RPC_URL);
        let balance = client.get_balance(&pubkey).expect("Balance failed");
        let blockhash = client.get_latest_blockhash().expect("Blockhash failed");

        let msg = Message::new_with_blockhash(
            &[transfer(&pubkey, &to_pubkey, balance)],
            Some(&pubkey),
            &blockhash,
        );
        let fee = client.get_fee_for_message(&msg).expect("Fee calc failed");

        let tx = Transaction::new_signed_with_payer(
            &[transfer(&pubkey, &to_pubkey, balance - fee)],
            Some(&pubkey),
            &[&keypair],
            blockhash,
        );

        let sig = client
            .send_and_confirm_transaction(&tx)
            .expect("Transaction failed");
        println!("Transaction success:");
        println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
        // https://explorer.solana.com/tx/2NfJ6UQvYmqriPsfqbWbwmbxt752rPWG7XgEhquCZJ1jQujTT6eaG7KEh2rXHzgD18aTumMXEsuqxdDLCK6D5Jcq?cluster=devnet
    }

    #[test]
    fn submit_rs_completion() {
        use solana_program::{
            instruction::{AccountMeta, Instruction},
            system_program,
        };
        use solana_sdk::transaction::Transaction;

        let rpc_client = RpcClient::new(RPC_URL);
        let signer = read_keypair_file("dev_wallet.json").expect("Couldn't find wallet file");

        let turbin3_program_id =
            Pubkey::from_str("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM").unwrap();
        let collection = Pubkey::from_str("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2").unwrap();
        let mpl_core_program =
            Pubkey::from_str("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d").unwrap();
        let system_program = system_program::id();

        // Mint will be created and signed by this tx
        let mint = Keypair::new();

        // Reconstruct the PDA using the same logic as in the TypeScript side
        let signer_pubkey = signer.pubkey();
        let seeds = &[b"prereqs", signer_pubkey.as_ref()];
        let (prereq_pda, _bump) = Pubkey::find_program_address(seeds, &turbin3_program_id);

        // The authority PDA (most likely a program-defined signer PDA)
        let (authority, _) = Pubkey::find_program_address(&[b"authority"], &turbin3_program_id);

        // Instruction discriminator for `submit_rs` (as per IDL)
        let data = vec![77, 124, 82, 163, 21, 133, 181, 206];

        let accounts = vec![
            AccountMeta::new(signer.pubkey(), true),
            AccountMeta::new(prereq_pda, false),
            AccountMeta::new(mint.pubkey(), true),
            AccountMeta::new(collection, false),
            AccountMeta::new_readonly(authority, false),
            AccountMeta::new_readonly(mpl_core_program, false),
            AccountMeta::new_readonly(system_program, false),
        ];

        let instruction = Instruction {
            program_id: turbin3_program_id,
            accounts,
            data,
        };

        let blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        let tx = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&signer.pubkey()),
            &[&signer, &mint],
            blockhash,
        );

        let sig = rpc_client
            .send_and_confirm_transaction(&tx)
            .expect("Failed to send transaction");

        println!("Transaction success:");
        println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
        // https://explorer.solana.com/tx/LiD9TzhUvHwr6qi5QRC6FnnCbM5UW6RiRyuXSgDxiLM3H5qwam43g49EPPdUVv2Qrf8qkfchJTExQuCkYbsCXx1?cluster=devnet
    }
}
