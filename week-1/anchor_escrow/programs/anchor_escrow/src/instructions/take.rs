use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::states::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    // the taker will be signing the transaction to send token b to maker
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    // this is the mint of token b that taker will give to maker
    #[account(
        mint::token_program = token_program
    )]
    pub mint_b: InterfaceAccount<'info, Mint>,

    // this is the mint of token a that taker will receive from vault
    #[account(
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,

    // this is the token account of taker for holding token b
    // it does not need to be initialised because if user has token a then it is already initialised
    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_ata_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // this is the token account of maker for holding token b
    // it may or may not exist
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // this is the token account of taker for holding token a
    // it may or may not exist
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_ata_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = maker, // maker gets the rent after closing
        has_one = mint_a, // valiates the mint_a of this struct with the mint_a of the Escrow struct
        has_one = maker, // similar to mint_a
        has_one = mint_b, // similar to mint_a
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    // ⚠️ Without has_one, someone could pass in a valid escrow account with mismatched fields, and potentially steal tokens or mess with logic.
    pub escrow: Account<'info, Escrow>,

    // this is the token account of escrow that is holding token a for escrorw
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Take<'info> {
    // function for taker to send token b to the maker
    // Note: its the spl transfer and not native transfer
    pub fn deposit(&mut self) -> Result<()> {
        // Get the number of decimals for this mint
        let decimals = self.mint_b.decimals;

        // The program being invoked in the CPI
        let cpi_program = self.token_program.to_account_info();

        // Create the TransferChecked struct with required accounts
        let cpi_accounts = TransferChecked {
            mint: self.mint_b.to_account_info(),
            from: self.taker_ata_b.to_account_info(),
            to: self.maker_ata_b.to_account_info(),
            authority: self.taker.to_account_info(),
        };

        // Combine the accounts and program into a "CpiContext"
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        // Make CPI to transfer_checked instruction on token program
        transfer_checked(cpi_context, self.escrow.receive, decimals)?;

        Ok(())
    }

    // function for transferring token a from vault to taker_ata_b
    // and then close the vault and escrow
    pub fn transfer_and_close_vault(&mut self) -> Result<()> {
        let signer_seeds: &[&[&[u8]]; 1] = &[&[
            b"escrow",
            self.maker.key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ]];

        // Get the number of decimals for this mint
        let decimals = self.mint_a.decimals;

        // The program being invoked in the CPI
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.taker_ata_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Make CPI to transfer_checked instruction on token program
        transfer_checked(cpi_context, self.vault.amount, decimals)?;

        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let close_cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            close_accounts,
            signer_seeds,
        );

        close_account(close_cpi_ctx)?;

        Ok(())
    }
}
