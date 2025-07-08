use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::states::VaultState;

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", user.key.as_ref()],
        bump = vault_state.state_bump,
        // specifies where the rent will go after closing
        close = user
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", user.key.as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    // system program is needed to transfer back the sol to the user and don't need to pay more rent
    // transfer all the sol from the vault to the user
    pub system_program: Program<'info, System>,
}

impl CloseVault<'_> {
    pub fn close(&mut self) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        let seeds: &[&[u8]] = &[
            b"vault",
            self.user.key.as_ref(),
            &[self.vault_state.vault_bump],
        ];

        let signer_seeds: &[&[&[u8]]] = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // use lamports to get all the balance from the vault account
        transfer(cpi_context, self.vault.lamports())
    }
}
