use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token_interface::{ Mint, TokenAccount, TransferChecked, TokenInterface, transfer_checked}
};

use crate::states::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Make<'info> {
    // The source token account owner
    #[account(mut)]
    pub maker: Signer<'info>,

    // The mint account specifying the type of token to be sent
    #[account(
      mint::token_program = token_program,
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,

    // The mint account specifying the type of token to be recieved
    #[account(
        mint::token_program = token_program
    )]
    pub mint_b: InterfaceAccount<'info, Mint>,

    // "This is a token account (e.g. an ATA), and I want to interact with its fields,
    // and possibly use it with different token programs like Token-2022 or a custom token interfae."
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,

    // this account Stores metadata about the trade: maker, mints, amount, bump…
    // Think of this like a record in a database: it's the logic and rules.
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump,
        space = 8 + Escrow::INIT_SPACE,
    )]
    pub escrow: Account<'info, Escrow>,

     #[account(
        init, 
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program    
    )]
    // this vault is needed to Actually hold the tokens that are being escrowed (token A)
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Interface is an Anchor type that allows for "flexible" program constraints
    // "I need an account in the context that must be the SPL Token program, and it must implement the TokenInterface
    // (i.e., allow token instructions like transfer, mint_to, etc.)."
    // The token program that will process the transfer
    pub token_program: Interface<'info, TokenInterface>,

    // The Associated Token Program is a small helper program that: Derives ATA addresses and x Creates them for you
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Make<'_> {
    pub fn init_escrow(&mut self, seed: u64, bump: &MakeBumps, receive: u64) -> Result<()>{
      self.escrow.set_inner(Escrow {
        seed, 
        maker: self.maker.key(),
        mint_a: self.mint_a.key(),
        mint_b: self.mint_b.key(),
        receive,
        bump: bump.escrow
      });
      Ok(())
    }

    // function for maker to send token a to the escrow
    // Note: its the spl transfer and not native transfer
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
      // Get the number of decimals for this mint
      let decimals = self.mint_a.decimals;

      // The program being invoked in the CPI
      let cpi_program = self.token_program.to_account_info();

      // Create the TransferChecked struct with required accounts
      let cpi_accounts = TransferChecked{
        mint: self.mint_a.to_account_info(),
        from: self.maker_ata_a.to_account_info(),
        to: self.vault.to_account_info(),
        authority: self.maker.to_account_info(),
      };

      // Create the TransferChecked instruction
      let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

      transfer_checked(cpi_ctx, amount, decimals)
    }
}