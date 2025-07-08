use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::states::VaultState;

#[derive(Accounts)]
pub struct Payment<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"state", user.key.as_ref()],
        bump = vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", user.key.as_ref()],
        bump = vault_state.vault_bump
    )]
    // this is where the vault will actually be created because here we are depositing the sol
    pub vault: SystemAccount<'info>,

    // system program is needed to transfer the native sol
    pub system_program: Program<'info, System>,
}

impl Payment<'_> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };

        // define the context to pass to the instruction of system_program using cpi
        // using "new" because the user will sign the tx
        // the user already signed for the ix in our program, so that sign is inherited to cpi
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_context, amount)
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        // When the CPI is processed, the Solana runtime will validate that the provided seeds and
        // caller program ID derive a valid PDA. The PDA is then added as a signer on the invocation.
        // "This mechanism allows for programs to sign for PDAs that are derived from their program ID."
        // “Hey, I control this PDA because I know the seeds used to generate it and it was created with my program ID.”
        let seeds: &[&[u8]] = &[
            b"vault",
            self.user.key.as_ref(),
            &[self.vault_state.vault_bump],
        ];

        let signer_seeds: &[&[&[u8]]] = &[&seeds[..]];

        // using "new_with_signer" because the pda will sign the tx now using the seeds
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_context, amount)
    }
}
