# Turbin3 Rust Prerequisites Assignment

## Setup

### Clone the Repository
```bash
git clone --filter=blob:none --sparse https://github.com/AvhiMaz/turbin-assignment
cd turbin-assignment
git sparse-checkout set prereq-assignment/turbin3-rust-assignment
cd prereq-assignment/turbin3-rust-assignment
```

**Alternative (full clone):**
```bash
git clone https://github.com/AvhiMaz/turbin-assignment
cd turbin-assignment/prereq-assignment/turbin3-rust-assignment
```

### Install Dependencies
```bash
cargo build
```

## Project Structure

```
turbin3-rust-assignment/
├── src/
│   └── lib.rs             # Main Rust implementation with all tests
├── dev_wallet.json        # Development wallet keypair
├── Cargo.toml            # Rust project configuration
└── Cargo.lock           # Dependency lock file
```

## Transaction Results

### Keypair Generation
- **Transaction**: Generated new Solana keypair for development

## Airdrop Request  
- **Transaction**: [4EacdwVk4oPmuQWGWLcnbb7o93P3d543aZUYkkv8dzsJ2Gn1CU24KTLJeVbSye45FoWHCwFPujo4D4xztgxbknnA](https://explorer.solana.com/tx/4EacdwVk4oPmuQWGWLcnbb7o93P3d543aZUYkkv8dzsJ2Gn1CU24KTLJeVbSye45FoWHCwFPujo4D4xztgxbknnA?cluster=devnet)

### SOL Transfer
- **Transaction**: [2R7xvSfDarrJ6iqnPPXbPJ6NxWH232qpLDK12nvBVgpCffeFziTERCdh49JPzJDMF66Zb7pWGNNi2wgaWkqLcpRT](https://explorer.solana.com/tx/2R7xvSfDarrJ6iqnPPXbPJ6NxWH232qpLDK12nvBVgpCffeFziTERCdh49JPzJDMF66Zb7pWGNNi2wgaWkqLcpRT?cluster=devnet)

### Dev-Wallet Drain
- **Transaction**: [2NfJ6UQvYmqriPsfqbWbwmbxt752rPWG7XgEhquCZJ1jQujTT6eaG7KEh2rXHzgD18aTumMXEsuqxdDLCK6D5Jcq](https://explorer.solana.com/tx/2NfJ6UQvYmqriPsfqbWbwmbxt752rPWG7XgEhquCZJ1jQujTT6eaG7KEh2rXHzgD18aTumMXEsuqxdDLCK6D5Jcq?cluster=devnet)

### Mint NFT
- **Transaction**: [LiD9TzhUvHwr6qi5QRC6FnnCbM5UW6RiRyuXSgDxiLM3H5qwam43g49EPPdUVv2Qrf8qkfchJTExQuCkYbsCXx1](https://explorer.solana.com/tx/LiD9TzhUvHwr6qi5QRC6FnnCbM5UW6RiRyuXSgDxiLM3H5qwam43g49EPPdUVv2Qrf8qkfchJTExQuCkYbsCXx1?cluster=devnet)