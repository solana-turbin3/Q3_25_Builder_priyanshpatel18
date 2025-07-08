use anchor_lang::prelude::*;

use crate::states::VaultState;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    // 'info telling that all the references inside the sruct will live as long as the struct itself
    // Everything in this struct only lives while the instruction is executing.
    // If I use user somewhere where the account it refers to is not valid, that would be a dangling pointer, and 'info helps ensure that user lives only as long as the struct it's in.
    #[account(mut)]
    // this is the account that is responsible for paying the rent of any accounts created in this ix
    // and also signing the transactions
    pub user: Signer<'info>,

    #[account(
      init,
      payer = user,
      space = 8 + VaultState::INIT_SPACE,
      seeds = [b"state", user.key().as_ref()],
      bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        seeds = [b"vault", user.key.as_ref()],
        bump
    )]
    // a systemAccount is a just for holding sol and no other data (can either be a keypair or a pda)
    // This account is a PDA, created using these seeds and bump.
    // It should be owned by the System Program, and just hold lamports (SOL), no custom struct
    // no need to "init" because a systemAccount is initialised automatically when we transfer enough sol to make the acc rent exempt
    pub vault: SystemAccount<'info>,

    // any account on chain is created by the system program
    // whenever you use the init constraint to create a new account, you must include the system program
    // in your accounts struct since it will be invoked to perform the account creation, later it gets assigned to custom program
    pub system_program: Program<'info, System>,
}

impl InitializeVault<'_> {
    // func to store initialise the PDAs and store the bumps on-chain in vault_statte pda
    pub fn initialize(&mut self, bumps: &InitializeVaultBumps) -> Result<()> {
        self.vault_state.vault_bump = bumps.vault;
        self.vault_state.state_bump = bumps.vault_state;
        Ok(())
    }
}
