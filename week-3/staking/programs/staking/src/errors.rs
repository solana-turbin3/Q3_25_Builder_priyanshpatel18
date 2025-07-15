use anchor_lang::prelude::*;

#[error_code]
pub enum UnstakeError {
  #[msg("Not frozen")]
  NotFrozen,

  #[msg("Nothing to unstake")]
  NothingToUnstake
}