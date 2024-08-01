document.addEventListener("DOMContentLoaded", (event) => {
  const lockButton = document.querySelector(".lock-button");
  const simulateButton = document.getElementById("simulate-button");

  // Disable lock button by default
  lockButton.disabled = true;

  simulateButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action
    console.log("Simulate button clicked");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Active tab found:", tabs[0].id);

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "addDropdowns" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log("Response received:", response.result);

            // Enable lock button after simulate button is clicked
            lockButton.disabled = false;
          }
        }
      );
    });
  });

  lockButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "toggleLock" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            // Re-enable lock button if there's an error
            lockButton.disabled = false;
          } else {
            lockButton.textContent = response.result ? "Unlock" : "Lock";
            // Disable lock button after clicking
            lockButton.disabled = true;
          }
        }
      );
    });
  });
});
