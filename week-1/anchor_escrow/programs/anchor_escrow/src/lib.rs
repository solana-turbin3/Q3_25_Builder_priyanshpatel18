use anchor_lang::prelude::*;

declare_id!("9ax4aVfqkFp3bH6uU55xjmhjXpaNSYD8RHczojX38PjJ");

pub mod instructions;
pub mod states;
pub mod constants;
pub mod errors;

pub use instructions::*;

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, amount: u64, receive: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, &ctx.bumps, receive)?;
        ctx.accounts.deposit(amount)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        ctx.accounts.transfer_and_close_vault()
    }
}