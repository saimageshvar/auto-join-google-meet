// Periodic fallback check every minute (Chrome MV3 minimum alarm period)
chrome.alarms.create('meet-check', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === 'meet-check') {
		await notifyMeetTabs();
	}
});

// Immediate check when a Meet tab becomes active
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	const tab = await chrome.tabs.get(tabId).catch(() => null);
	if (tab?.url?.includes('meet.google.com')) {
		chrome.tabs.sendMessage(tabId, { type: 'CHECK_JOIN' }).catch(() => {});
	}
});

// Immediate check when any window gains focus (covers unfocused PWA window)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) return;
	const tabs = await chrome.tabs.query({ active: true, windowId }).catch(() => []);
	for (const tab of tabs) {
		if (tab.url?.includes('meet.google.com')) {
			chrome.tabs.sendMessage(tab.id, { type: 'CHECK_JOIN' }).catch(() => {});
		}
	}
});

async function notifyMeetTabs() {
	const tabs = await chrome.tabs.query({ url: 'https://meet.google.com/*' }).catch(() => []);
	for (const tab of tabs) {
		chrome.tabs.sendMessage(tab.id, { type: 'CHECK_JOIN' }).catch(() => {});
	}
}
