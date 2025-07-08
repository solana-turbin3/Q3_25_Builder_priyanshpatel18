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
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    // The mint account specifying the type of token to be sent
    #[account(
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,

    //
    #[account(
        mut,
        close = maker, // maker gets the rent after closing
        has_one = mint_a, // valiates the mint_a of this struct with the mint_a of the Esrow struct
        has_one = maker, // similar to mint_a
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    // ⚠️ Without has_one, someone could pass in a valid escrow account with mismatched fields, and potentially steal tokens or mess with logic.
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut, // only mutable because it is already initialised and just need to be closed
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program    
    )]
    // this vault is needed to Actually hold the tokens that are being escrowed (token A)
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Refund<'info> {
    pub fn refund_and_close_vault(&mut self) -> Result<()> {
        let signer_seeds: &[&[&[u8]]; 1] = &[&[
            b"escrow", 
            self.maker.key.as_ref(), 
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump]
        ]];
        
        // Get the number of decimals for this mint
        let decimals = self.mint_a.decimals;

        // The program being invoked in the CPI
        let cpi_program = self.token_program.to_account_info();

        // Create the TransferChecked struct with required accounts
        let cpi_accounts = TransferChecked{            
            mint: self.mint_a.to_account_info(),
            from: self.vault.to_account_info(),
            to: self.maker_ata_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        // Combine the accounts and program into a "CpiContext"
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
            signer_seeds
        );

        close_account(close_cpi_ctx)?;

        Ok(())
    }
}