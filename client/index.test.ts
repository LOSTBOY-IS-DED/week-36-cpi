import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";

import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";

// what doesn't come inbuilt is custom contract

test("one transfer", () => {
  const svm = new LiteSVM();
  // it accepts a public key --> deployed contract
  const contractPubKey = PublicKey.unique();
  // landing our contract to the local solana blockchain
  svm.addProgramFromFile(contractPubKey, "./double.so"); // it accepts the path to a file we have the contract deployed over here
  // creating a new account on it
  const payer = new Keypair();
  // airdrop some solana to it
  svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
  const dataAccount = Keypair.generate();
  const blockhash = svm.latestBlockhash();
  // const transferLamports = 1_000_000n;
  // console.log(payer.publicKey.toBase58());
  // console.log(dataAccount.publicKey.toBase58());

  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: contractPubKey, // the account which will double contract public key here
    }),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.feePayer = payer.publicKey;
  tx.sign(payer, dataAccount); // we can only call the sign function once
  svm.sendTransaction(tx);
  const balanceAfter = svm.getBalance(dataAccount.publicKey);
  expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));

  // how to send instruction to the custom contract // as i dig through the create Account function it just creates a new  transaction we are gonna do the same

  function doubleIt() {
    const ix2 = new TransactionInstruction({
      keys: [
        //our contract only has one account to pass thats pubKey
        { pubkey: dataAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      ],
      programId: contractPubKey,
      data: Buffer.from(""),
    });
    // now lets send the transaction
    const blockhash = svm.latestBlockhash(); // setting it again
    const tx2 = new Transaction();
    tx2.recentBlockhash = blockhash;
    tx2.feePayer = payer.publicKey;
    tx2.add(ix2);
    tx2.sign(payer); // we can only call the sign function once
    const response = svm.sendTransaction(tx2);
    // console.log(response); // this must throw an error now
    console.log(response.toString());
    svm.expireBlockhash(); // expiring it again
  }

  doubleIt();
  doubleIt();
  doubleIt();
  doubleIt();

  // now we should actually check does it actually have the data which has space 4
  const newDataAccount = svm.getAccount(dataAccount.publicKey);
  console.log(newDataAccount?.data);

  expect(newDataAccount?.data[0]).toBe(8); //8
  expect(newDataAccount?.data[1]).toBe(0);
  expect(newDataAccount?.data[2]).toBe(0);
  expect(newDataAccount?.data[3]).toBe(0);
});

// NOTE : we should have a check that the dataAccount must sign the transaction and the contract should verify it
// NOTE : we are expiring and reinitialising blockhash
