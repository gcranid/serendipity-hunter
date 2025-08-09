/**
 *
 * assets/js/index.js
 *
 */

import { startMining, stopMining } from "./generator.js";

document.addEventListener("DOMContentLoaded", () => {
	// Get DOM elements
	const startButton = document.getElementById("start-button");
	const stopButton = document.getElementById("stop-button");
	const providerUrlInput = document.getElementById("provider-url");
	const inputSection = document.getElementById("input-section");
	const outputSection = document.getElementById("output-section");

	// Event listener for the Start button
	startButton.addEventListener("click", () => {
		const providerUrl = providerUrlInput.value.trim();
		if (!providerUrl) {
			alert("Please enter a valid provider URL.");
			return;
		}

		// Update UI for mining state
		inputSection.style.display = "none";
		outputSection.classList.remove("hidden");
		startButton.classList.add("hidden");
		stopButton.classList.remove("hidden");

		// Start the mining process
		startMining(providerUrl);
	});

	// Event listener for the Stop button
	stopButton.addEventListener("click", () => {
		// Stop the mining process
		stopMining();

		// Update UI for idle state
		inputSection.style.display = "block";
		// outputSection.classList.add("hidden"); // Optionally hide output on stop
		startButton.classList.remove("hidden");
		stopButton.classList.add("hidden");
	});

	console.log("Scripts active.");
});
