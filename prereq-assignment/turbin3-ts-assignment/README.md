# Turbin3 TypeScript Prerequisites Assignment

## Setup

### Clone the Repository
```bash
git clone --filter=blob:none --sparse https://github.com/priyanshpatel18/Q3_25_Builder_Priyansh
cd Q3_25_Builder_Priyansh
git sparse-checkout set prereq-assignment/turbin3-ts-assignment/airdrop
cd prereq-assignment/turbin3-ts-assignment/airdrop
```

**Alternative (full clone):**
```bash
git clone https://github.com/priyanshpatel18/Q3_25_Builder_Priyansh
cd Q3_25_Builder_Priyansh/prereq-assignment/turbin3-ts-assignment/airdrop
```

### Install Dependencies
```bash
yarn
```

## Project Structure

```
airdrop/
├── keygen.ts          # Keypair generation script
├── airdrop.ts         # Devnet token airdrop script
├── transfer.ts        # SOL transfer script
├── enroll.ts          # Turbin3 enrollment interaction
├── programs/
│   └── Turbin3_prereq.ts  # IDL definitions
├── dev-wallet.json    # Development wallet (auto-generated)
├── Turbin3-wallet.json    # Main wallet for enrollment
└── package.json
```

## Transaction Results

### Wallet Airdrop
- **Transaction**: [4WgXj1NMatwvG2srJAiqLCkvSDssSGFKFF5kfJWXfMjLX4esJTQgzuXpcweDoiktZkKLYn1mMe3shL681ouxgN7j](https://explorer.solana.com/tx/4WgXj1NMatwvG2srJAiqLCkvSDssSGFKFF5kfJWXfMjLX4esJTQgzuXpcweDoiktZkKLYn1mMe3shL681ouxgN7j?cluster=devnet)

### Small Transfer  
- **Transaction**: [4yHGQ3UVawXoMzpwD3ex3r2H8p6LCbgP6FoAffeYaJSkrGtpqE2L3c26BDiJxKpr4tbB3qGBuUuKcTLVABuFf1pJ](https://explorer.solana.com/tx/4yHGQ3UVawXoMzpwD3ex3r2H8p6LCbgP6FoAffeYaJSkrGtpqE2L3c26BDiJxKpr4tbB3qGBuUuKcTLVABuFf1pJ?cluster=devnet)

### Drain Devnet Wallet
- **Transaction**: [4WbeheV9od5eWh1sfjDsLQ9xJyUKiZSwSmmj71hsXmGZsk7vjhgPuEbqPn4MZfX88rBHPCXBvgxKBYEgMqoDr75S](https://explorer.solana.com/tx/4WbeheV9od5eWh1sfjDsLQ9xJyUKiZSwSmmj71hsXmGZsk7vjhgPuEbqPn4MZfX88rBHPCXBvgxKBYEgMqoDr75S?cluster=devnet)

### Initialize
- **Transaction**: [3D3LvNVkEwEqtXMT1PtGPcGMv7huouEPZrR9MYsmuKyCbecKDyRNJ4deYjeB1XxBWnjVrFf6CpjyA3pFhMEhFjnW](https://explorer.solana.com/tx/3D3LvNVkEwEqtXMT1PtGPcGMv7huouEPZrR9MYsmuKyCbecKDyRNJ4deYjeB1XxBWnjVrFf6CpjyA3pFhMEhFjnW?cluster=devnet)
  
## Submission

- **Transaction**: [5QeEUj4ncn5TstVMe9P2yfvZpiHgejSTzv83Vkogwnp8rdVtty7E5ktP7Ps2QUxvaT82uHf1MFTvKwksWWnBSPRJ](https://explorer.solana.com/tx/5QeEUj4ncn5TstVMe9P2yfvZpiHgejSTzv83Vkogwnp8rdVtty7E5ktP7Ps2QUxvaT82uHf1MFTvKwksWWnBSPRJ?cluster=devnet)