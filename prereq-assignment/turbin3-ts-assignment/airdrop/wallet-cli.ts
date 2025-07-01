import bs58 from 'bs58';
import promptSync from 'prompt-sync';
import fs from 'fs';

const prompt = promptSync();

console.log("Solana Wallet CLI");
console.log("1: Convert base58 to byte array");
console.log("2: Convert byte array to base58");

const option = prompt("Choose 1 or 2: ");

if (option === '1') {
  const base58 = prompt("Enter base58 secret key: ");
  try {
    const bytes = bs58.decode(base58);
    console.log("Byte array:", Array.from(bytes));
  } catch (e) {
    console.error("Invalid base58 input");
  }

} else if (option === '2') {
  const fromFile = prompt("Load from dev-wallet.json? (y/n): ");

  let byteArray: number[] = [];

  if (fromFile.toLowerCase() === 'y') {
    try {
      const raw = fs.readFileSync('dev-wallet.json', 'utf-8');
      byteArray = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to read wallet.json");
      process.exit(1);
    }
  } else {
    const input = prompt("Enter comma-separated bytes: ");
    byteArray = input.split(',').map(x => parseInt(x.trim(), 10));
  }

  try {
    const base58 = bs58.encode(Uint8Array.from(byteArray));
    console.log("Base58 key:", base58);
  } catch (e) {
    console.error("Failed to encode to base58");
  }

} else {
  console.log("Invalid option");
}
