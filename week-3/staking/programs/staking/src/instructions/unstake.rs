use crate::{errors::UnstakeError, states::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

#[derive(Accounts)]
pub struct Unstake<'info> {
    /// User who wants to unstake their NFT
    #[account(mut)]
    pub user: Signer<'info>,

    /// User's staking account to update stake count
    #[account(
        mut,
        seeds = [b"user", user.key.as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,

    /// Global config with staking parameters (needed for authority)
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, StakeConfig>,

    /// NFT mint being unstaked
    pub nft_mint: Account<'info, Mint>,

    /// Stake record for this specific NFT (will be closed)
    #[account(
        mut,
        seeds = [b"stake", user.key.as_ref(), nft_mint.key().as_ref()],
        bump = stake_account.bump,
        close = user  // Return rent to user when account is closed
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// Vault holding the staked NFT
    #[account(
        mut,
        seeds = [b"vault", nft_mint.key().as_ref()],
        bump,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    /// User's NFT token account (destination for NFT return)
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,

    /// Required programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

impl<'info> Unstake<'info> {
    /// Execute the unstaking operation
    pub fn unstake(&mut self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        // Verify freeze period has passed
        require!(
            now - self.stake_account.stake_at >= self.config.freeze_period as i64,
            UnstakeError::NotFrozen
        );

        // Verify user has staked NFTs to unstake
        require!(
            self.user_account.amount_staked > 0,
            UnstakeError::NothingToUnstake
        );

        // Decrease user's staked amount
        self.user_account.amount_staked -= 1;

        // Create signer seeds for config PDA to authorize NFT transfer
        let seeds: &[&[u8]] = &[b"config", &[self.config.bump]];
        let signer = &[seeds];

        // Transfer NFT from vault back to user
        let cpi_accounts = Transfer {
            from: self.vault_ata.to_account_info(),
            to: self.user_nft_ata.to_account_info(),
            authority: self.config.to_account_info(),  // Config PDA signs
        };

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer
        );
        transfer(cpi_ctx, 1)?;  // Transfer 1 NFT token back

        Ok(())
    }
}
