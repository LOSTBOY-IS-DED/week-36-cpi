import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

test("CPI works as expected", async () => {
  const svm = new LiteSVM();

  const doubleContract = PublicKey.unique();
  const cpiContract = PublicKey.unique();

  svm.addProgramFromFile(doubleContract, "./first-double.so");
  svm.addProgramFromFile(cpiContract, "./cpi.so");

  const userAcc = new Keypair();
  const dataAcc = new Keypair();

  await svm.airdrop(userAcc.publicKey, BigInt(1_000_000_000));

  await createDataAccountOnChain(svm, dataAcc, userAcc, doubleContract);

  // Prepare CPI transaction
  const ix = new TransactionInstruction({
    keys: [
      { pubkey: dataAcc.publicKey, isSigner: true, isWritable: true },
      { pubkey: doubleContract, isSigner: false, isWritable: false },
    ],
    programId: cpiContract,
    data: Buffer.from(""),
  });

  const blockhash = await svm.latestBlockhash();

  const transaction = new Transaction().add(ix);
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = userAcc.publicKey;
  transaction.sign(userAcc, dataAcc);

  const res = await svm.sendTransaction(transaction);
  console.log(res.toString());
  const dataAccountData = svm.getAccount(dataAcc.publicKey);
  expect(dataAccountData?.data[0]).toBe(1);
  expect(dataAccountData?.data[1]).toBe(0);
  expect(dataAccountData?.data[2]).toBe(0);
  expect(dataAccountData?.data[3]).toBe(0);
});

async function createDataAccountOnChain(
  svm: LiteSVM,
  dataAccount: Keypair,
  payer: Keypair,
  contractPubKey: PublicKey
) {
  const blockhash = await svm.latestBlockhash();

  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(await svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: contractPubKey,
    }),
  ];

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.feePayer = payer.publicKey;
  tx.sign(payer, dataAccount);

  await svm.sendTransaction(tx);
}
