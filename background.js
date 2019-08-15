chrome.webNavigation.onCommitted.addListener(updateIcon);
chrome.webNavigation.onHistoryStateUpdated.addListener(updateIcon);
chrome.webNavigation.onBeforeNavigate.addListener(updateIcon);

var activeTabs = [];

// turn on the button and add/remove listener
chrome.browserAction.onClicked.addListener(function(tab) {
  if (!activeTabs.includes(tab.id)) {
    activeTabs.push(tab.id);
    setIcon(tab.id, true);
    chrome.webRequest.onResponseStarted.addListener(checkAndReload, {urls: ["<all_urls>"], tabId: tab.id});
  } else {
    while (activeTabs.length > 0) {
      setIcon(activeTabs.pop(), false);
    }
    chrome.webRequest.onResponseStarted.removeListener(checkAndReload);
  }
  
});

// check the response status and reload
function checkAndReload(details) {
  if (activeTabs.includes(details.tabId)) {
    console.log("start monitoring");
  } else {
    console.log("should not print, since listener removed.");
  }
  if (details.statusCode >= 500) {
    console.log(details.statusCode);
    console.log(details.type);
    chrome.tabs.reload(details.tabId);
  }
}

// Set the right icon in the given tab id, depending on that tab's active state.
function setIcon(tabId, isActive) {
  const path = isActive ? "image/icon_on.png" : "image/icon_off.png";
  chrome.browserAction.setIcon({
    path, tabId
  });
}

// update the icon on refresh/other state, by the browser
function updateIcon(details) {
  if (details.frameId != 0) {
    return; // only update the icon for main page, not iframe/frame
  }
  const path = activeTabs.includes(details.tabId) ? "image/icon_on.png" : "image/icon_off.png";
  chrome.browserAction.setIcon({
    path: path,
    tabId: details.tabId
  });
}