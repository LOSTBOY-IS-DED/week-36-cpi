import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";

import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
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
});
