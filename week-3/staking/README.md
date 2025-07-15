# Solana NFT Staking Program

A Solana program that allows users to stake NFTs and earn reward points. The program implements a time-based freeze period mechanism to prevent immediate unstaking and includes configurable parameters for staking rewards.

## Features

- **NFT Staking**: Users can stake their NFTs to earn reward points
- **Configurable Parameters**: Admin can set points per stake, maximum unstake limit, and freeze period
- **Time-based Freeze Period**: Prevents immediate unstaking to ensure commitment
- **Reward Token System**: Creates a reward token mint for future reward distributions
- **Secure Vault System**: NFTs are stored in program-controlled vaults during staking
- **User Account Management**: Tracks individual user staking statistics and points

## Program Structure

### Instructions

1. **Initialize Config** - Sets up global staking parameters (admin only)
2. **Initialize User** - Creates a user account for staking participation
3. **Stake** - Stakes an NFT and awards points to the user
4. **Unstake** - Unstakes an NFT after the freeze period has passed

### Account Types

- **StakeConfig**: Global configuration storing staking parameters
- **UserAccount**: Individual user data including points and staked amount
- **StakeAccount**: Records for individual staked NFTs with timestamps

### Program Derived Addresses (PDAs)

- **Config PDA**: `[b"config"]` - Global configuration account
- **Reward Mint PDA**: `[b"rewards", config.key()]` - Reward token mint
- **User Account PDA**: `[b"user", user.key()]` - User-specific staking data
- **Vault PDA**: `[b"vault", nft_mint.key()]` - NFT storage vault
- **Stake Account PDA**: `[b"stake", user.key(), nft_mint.key()]` - Individual stake records

## Usage

### Configuration Parameters

When initializing the config, you can set:

- **points_per_stake**: Points awarded per staked NFT (u8)
- **max_unstake**: Maximum number of NFTs that can be unstaked at once (u8)
- **freeze_period**: Required staking duration in seconds (u32)

### Basic Flow

1. **Admin Setup**: Initialize the global configuration
2. **User Registration**: Users initialize their staking accounts
3. **Staking**: Users stake NFTs and receive points
4. **Unstaking**: Users can unstake after the freeze period expires

### Example Usage

```typescript
// Initialize config (admin only)
await program.methods
  .initializeConfig(10, 5, 86400) // 10 points, max 5 unstake, 24h freeze
  .accounts({
    admin: adminPublicKey,
    config: configPda,
    rewardMint: rewardMintPda,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .rpc();

// Initialize user account
await program.methods
  .initializeUser()
  .accounts({
    user: userPublicKey,
    userAccount: userAccountPda,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// Stake NFT
await program.methods
  .stake()
  .accounts({
    user: userPublicKey,
    userAccount: userAccountPda,
    config: configPda,
    nftMint: nftMintPublicKey,
    userNftAta: userNftAta,
    vaultAta: vaultAta,
    stakeAccount: stakeAccountPda,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
    clock: SYSVAR_CLOCK_PUBKEY,
  })
  .rpc();

// Unstake NFT (after freeze period)
await program.methods
  .unstake()
  .accounts({
    user: userPublicKey,
    userAccount: userAccountPda,
    config: configPda,
    nftMint: nftMintPublicKey,
    stakeAccount: stakeAccountPda,
    vaultAta: vaultAta,
    userNftAta: userNftAta,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
    clock: SYSVAR_CLOCK_PUBKEY,
  })
  .rpc();
```

## Testing

The program includes comprehensive tests covering:

- Configuration initialization
- User account management
- NFT staking operations
- Freeze period enforcement
- Unstaking functionality
- Error handling and edge cases

Run the test suite:
```bash
anchor test
```

Test coverage includes:
- Successful operations for all instructions
- Proper error handling for invalid operations
- State verification after each operation
- Token balance verification
- Account closure verification

## Deployment Information

### Devnet
- **Program ID**: [`5EfKLXSFCVVEZig29bgRynsgBUBXnkMKnPPdBkstRPef`](https://explorer.solana.com/address/5EfKLXSFCVVEZig29bgRynsgBUBXnkMKnPPdBkstRPef?cluster=devnet)

### Example Transactions

The following transactions demonstrate the complete vault lifecycle on devnet:

**Initialize Config:**
[`4Fzaewjriw2P9mhZSKVvwbDnheXAQjSSLAcQ6cQNYWfwQEwqXJJE12b4VsXm1E1UXwWXWs3LMrZHABvVEvxpCD7q`](https://explorer.solana.com/transaction/4Fzaewjriw2P9mhZSKVvwbDnheXAQjSSLAcQ6cQNYWfwQEwqXJJE12b4VsXm1E1UXwWXWs3LMrZHABvVEvxpCD7q?cluster=devnet)

**Initialize User:**
[`5D7z5qhNW2nVY35o5PD1aTYGxqAAoB5dobgDq6oFxZ73tQi84Zk5Ga5ZasNRm4XkDJsi5r5owVFLpT9f2ifNXqHj`](https://explorer.solana.com/transaction/5D7z5qhNW2nVY35o5PD1aTYGxqAAoB5dobgDq6oFxZ73tQi84Zk5Ga5ZasNRm4XkDJsi5r5owVFLpT9f2ifNXqHj?cluster=devnet)

**Stake:**
[`2ofBRY1JPjW6uKJFGQmcpd22fhk1VarZsVog1DNFiUkvWb8RpEb959Mr6WS9Jjb1QHpW5Yh5TrUoLrqnxR9DgG7x`](https://explorer.solana.com/transaction/2ofBRY1JPjW6uKJFGQmcpd22fhk1VarZsVog1DNFiUkvWb8RpEb959Mr6WS9Jjb1QHpW5Yh5TrUoLrqnxR9DgG7x?cluster=devnet)  

**Unstake:**
[`5PmvsHHuXr5u7fpNPfrJ2ymZmNd8uzHoHL1SBddVGwRZXkD4jAcss3DZ9MZawqidvjsvbxHDd7bg9Bc3vWhp37rP`](https://explorer.solana.com/transaction/5PmvsHHuXr5u7fpNPfrJ2ymZmNd8uzHoHL1SBddVGwRZXkD4jAcss3DZ9MZawqidvjsvbxHDd7bg9Bc3vWhp37rP?cluster=devnet)

## Error Handling

The program defines custom errors for better debugging:

- **NotFrozen**: Attempted to unstake before freeze period expired
- **NothingToUnstake**: User has no staked NFTs to unstake

## License

This program is provided as-is for educational and development purposes. Use at your own risk in production environments.

## Contributing

Contributions are welcome! Please ensure all tests pass and follow Rust/Anchor best practices.