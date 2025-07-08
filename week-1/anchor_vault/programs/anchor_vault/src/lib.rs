use anchor_lang::prelude::*;

declare_id!("DSr9tqWZo25DRFKvGCmgwZiAGbfGjmDgXCWUfjWDMg2p");

pub mod instructions;
pub mod states;
pub mod constants;
pub mod errors;

pub use instructions::*;

#[program]
pub mod anchor_vault {
    use super::*;

    pub fn initialize(ctx: Context<InitializeVault>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }
    pub fn deposit(ctx: Context<Payment>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)
    }
    pub fn withdraw(ctx: Context<Payment>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)
    }
    pub fn close(ctx: Context<CloseVault>) -> Result<()> {
        ctx.accounts.close()
    }
}