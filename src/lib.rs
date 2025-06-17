use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::{self, ProgramResult},
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

fn process_instruction(
    // it takes three things
    program_id: &Pubkey,
    accounts: &[AccountInfo], //[data_account]
    instruction_data: &[u8],
) -> ProgramResult {
    // how to grab the first account
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;

    // either write the thing below or add the question mark
    // match data_account{
    //     Ok(data_account) => {},
    //     Err(err) => {return Err(err)}
    // }
}
