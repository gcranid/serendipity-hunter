/**
 *
 * assets/js/provider.js
 *
 */

import Web3 from "web3";

/**
 * Creates and returns a Web3 instance connected to the given provider URL.
 * @param {string} providerUrl - The URL of the Ethereum provider.
 * @returns {Web3 | null} A Web3 instance or null if the URL is invalid.
 */

function getWeb3Provider(providerUrl) {
	try {
		// Use an HTTP provider for the connection
		const provider = new Web3.providers.HttpProvider(providerUrl);
		const web3 = new Web3(provider);
		return web3;
	} catch (error) {
		console.error("Failed to create Web3 provider:", error);
		alert("Invalid Provider URL. Please check the URL and try again.");
		return null;
	}
}

export { getWeb3Provider };
