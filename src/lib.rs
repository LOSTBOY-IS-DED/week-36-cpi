use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::{self, ProgramResult},
    pubkey::Pubkey,
};

entrypoint!(process_instruction);
#[derive(BorshSerialize, BorshDeserialize)]

struct OnChainData {
    count: u32,
}

fn process_instruction(
    // it takes three things
    program_id: &Pubkey,
    accounts: &[AccountInfo], //[data_account]
    instruction_data: &[u8],
) -> ProgramResult {
    // how to grab the first account
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;

    let mut counter = OnChainData::try_from_slice(&data_account.data.borrow_mut())?;

    if counter.count == 0 {
        counter.count == 1;
    } else {
        counter.count = counter.count * 2
    }

    counter.serialize(&mut *data_account.data.borrow_mut());

    ProgramResult::Ok(())
    // either write the thing below or add the question mark
    // match data_account{
    //     Ok(data_account) => {},
    //     Err(err) => {return Err(err)}
    // }
}
