document.getElementById("simulate-button").addEventListener("click", () => {
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
        }
      }
    );
  });
});
