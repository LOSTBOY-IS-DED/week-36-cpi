use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction}, // ✅ Added
    program::invoke,                         // ✅ Added
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    publicKey: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let double_contract_address = next_account_info(&mut iter)?;

    // get accounts and invoke
    // invoke takes instruction and account_infos --> account_infos are bunch of account the next contract excepts
    // instruction is similar as previous instruction

    let instruction = Instruction {
        program_id: *double_contract_address.key,
        accounts: vec![AccountMeta {
            is_signer: true,
            is_writable: true,
            pubkey: *data_account.key,
        }],
        data: vec![],
    };

    let res = invoke(&instruction, &[data_account.clone()])?;
    Ok(());
}
