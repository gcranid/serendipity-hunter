/**
 *
 * assets/js/generator.js
 *
 */

import * as bip39 from "bip39";
import HDKey from "hdkey";
import Web3 from "web3";
import { Buffer } from "buffer";
import { getWeb3Provider } from "./provider.js";

// Ensure Buffer is available globally
window.Buffer = Buffer;

let isMining = false;
let foundCount = 0;

// Create a new web3 instance just to access the accounts utility
const web3Accounts = new Web3().eth.accounts;

const outputMnemonic = document.getElementById("output-mnemonic");
const outputAddress = document.getElementById("output-address");
const outputPrivateKey = document.getElementById("output-private-key");
const outputStatus = document.getElementById("output-status");
const foundCounter = document.getElementById("found-counter");
const outputBalance = document.getElementById("output-balance");

/**
 * Derives an Ethereum account from a mnemonic using hdkey and web3.js.
 * @param {string} mnemonic - The BIP39 mnemonic phrase.
 * @returns {Promise<{address: string, privateKey: string}>}
 */
async function deriveAccount(mnemonic) {
	// 1. Generate a seed from the mnemonic
	const seed = await bip39.mnemonicToSeed(mnemonic);

	// 2. Create a master key from the seed
	const root = HDKey.fromMasterSeed(seed);

	// 3. Derive the account at the standard Ethereum path
	const addrNode = root.derive("m/44'/60'/0'/0/0");

	// 4. Get the private key as a hex string
	const privateKey = `0x${addrNode.privateKey.toString("hex")}`;

	// 5. Use web3.js to get the account object from the private key
	const account = web3Accounts.privateKeyToAccount(privateKey);

	return { address: account.address, privateKey: account.privateKey };
}

/**
 * Saves the found account details to a .txt file and triggers a download.
 * @param {string} mnemonic
 * @param {string} address
 * @param {string} privateKey
 */
function saveToFile(mnemonic, address, privateKey) {
	const fileContent = `
!!! Account with funds found !!!
Save this file in a secure location. Do not share it with anyone.

--- Details ---
Mnemonic:     ${mnemonic}
Address:      ${address}
Private Key:  ${privateKey}
-----------------
  `;
	const blob = new Blob([fileContent.trim()], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `found_wallet_${address}.txt`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	// Update found counter
	foundCount++;
	foundCounter.textContent = `Wallets Found: ${foundCount}`;
}

/**
 * Starts the mining loop.
 * @param {string} providerUrl - The provider URL to check balances.
 */
async function startMining(providerUrl) {
	isMining = true;
	const web3 = getWeb3Provider(providerUrl);

	if (!web3) {
		isMining = false;
		return; // Stop if the provider is invalid
	}

	console.log("Mining started...");

	// The main generation and checking loop
	async function mine() {
		if (!isMining) {
			outputStatus.textContent = "Status: Stopped.";
			console.log("Mining stopped.");
			return;
		}

		try {
			// 1. Generate mnemonic
			const mnemonic = bip39.generateMnemonic();

			// 2. Derive account
			const { address, privateKey } = await deriveAccount(mnemonic);

			// Update UI
			outputMnemonic.textContent = `Mnemonic: ${mnemonic}`;
			outputAddress.textContent = `Address: ${address}`;
			outputPrivateKey.textContent = `Private Key: ${privateKey}`;
			outputStatus.textContent = `Status: Checking balance for ${address}`;

			// 3. Check balance
			const balanceWei = await web3.eth.getBalance(address);
			const balanceEth = web3.utils.fromWei(balanceWei, "ether");

			outputStatus.textContent = `Status: Checked ${address}`;
			outputBalance.textContent = `Balance: ${balanceEth} ETH`;

			// 4. If funds are found, save them
			if (parseFloat(balanceEth) > 0) {
				outputStatus.textContent = `Status: !!! SUCCESS! Found funds for ${address} !!!`;
				saveToFile(mnemonic, address, privateKey);
			}
		} catch (error) {
			console.error("An error occurred during mining:", error);
			outputStatus.textContent = `Status: Error occurred. Check console. Retrying...`;
		}

		// Continue the loop without blocking the UI thread
		setTimeout(mine, 1000);
	}

	mine(); // Start the loop
}

/**
 * Stops the mining process.
 */
function stopMining() {
	isMining = false;
}

export { startMining, stopMining };
