function autoJoinMeetEntrypoint() {
	let intervalId = null;
	let cameraDisabledOnce = false;

	function tryDisableCamera() {
		const turnOffVideo = selectElementsByAriaLabel("turn off camera");
		if (turnOffVideo.length > 0) {
			turnOffVideo.forEach(e => e.click());
			cameraDisabledOnce = true;
			document.documentElement.dataset.cjsCameraDisabled = "1";
		}
	}

	function teardown() {
		clearInterval(intervalId);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('focus', handleFocus);
	}

	function checkAndJoin() {
		try {
			if (!cameraDisabledOnce) tryDisableCamera();

			const joinNowElements = [...document.querySelectorAll("span")].filter((ele) => ele.textContent === "Join now");
			const divs = [...document.querySelectorAll('div')];
			const someoneIsPresent = divs.find(e => e.textContent.match(/in this call/));

			if (joinNowElements.length > 0 && someoneIsPresent) {
				joinNowElements.forEach(el => el.click());
			}

			if (cameraDisabledOnce && joinNowElements.length === 0) {
				teardown();
			}
		} catch (err) {
			console.log("Error", err);
		}
	}

	function handleVisibilityChange() {
		if (document.visibilityState === 'visible') checkAndJoin();
	}

	function handleFocus() {
		checkAndJoin();
	}

	intervalId = setInterval(checkAndJoin, 2000);
	document.addEventListener('visibilitychange', handleVisibilityChange);
	window.addEventListener('focus', handleFocus);

	chrome.runtime.onMessage.addListener((message) => {
		if (message.type === 'CHECK_JOIN') checkAndJoin();
	});
}

function selectElementsByAriaLabel(pattern) {
  const regex = new RegExp(pattern, 'i'); // 'i' flag for case-insensitive
  const allElements = document.querySelectorAll('[aria-label]');
  const matchedElements = Array.from(allElements).filter(el => 
    regex.test(el.getAttribute('aria-label'))
  );
  return matchedElements;
}

function meetingClickHandler(event) {
	quickConnectFor(this);
}

function quickConnectFor(meetingElement) {
	const interval = setInterval(function () {
		try {
			const sendMessageButton = meetingElement.closest("c-wiz").querySelector('[title="Send Message" i]');
			if (!sendMessageButton?.disabled) {
				sendMessageButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
				sendMessageButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
				sendMessageButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
				clearInterval(interval);
			}
		} catch (err) {
			console.log("Error", err);
		}
	}, 100);
}

function quickVideoCallEntrypoint() {
	const interval = setInterval(function () {
		const newMeetingElements = [...document.querySelectorAll('[title="Add video meeting"]')];
		newMeetingElements.forEach(newMeetingElement => {
			if (newMeetingElement) {
				if (!newMeetingElement.dataset.cjsQuickMeetingInitialized) {
					newMeetingElement.classList.add("cjs-quick-meeting");
					newMeetingElement.addEventListener('click', meetingClickHandler);
					newMeetingElement.dataset.cjsQuickMeetingInitialized = true;
				}
			}
		});
	}, 500);
}

function isAutoJoinMeetEntrypoint(url) {
	return url.includes("meet.google.com");
}

function chatShortcutsEntrypoint() {
	const fire = (target, key, code, keyCode, modifiers = {}) => {
		const opts = { key, code, keyCode, which: keyCode, bubbles: true, cancelable: true, ...modifiers };
		target.dispatchEvent(new KeyboardEvent('keydown', opts));
		target.dispatchEvent(new KeyboardEvent('keypress', opts));
		target.dispatchEvent(new KeyboardEvent('keyup', opts));
	};

	const blurActive = () => {
		if (document.activeElement && document.activeElement !== document.body) {
			document.activeElement.blur();
		}
	};

	window.addEventListener('keydown', (e) => {
		const ctrlOnly = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey;

		// Ctrl+P → Esc + Q (new chat)
		if (ctrlOnly && (e.key === 'p' || e.key === 'P')) {
			e.preventDefault();
			e.stopPropagation();
			blurActive();
			const target = document.body;
			fire(target, 'Escape', 'Escape', 27);
			setTimeout(() => fire(target, 'q', 'KeyQ', 81), 50);
			return;
		}

		// Alt+ArrowDown / Alt+ArrowUp → next/prev conversation (Chat builtin Ctrl+Alt+↓/↑)
		const altOnly = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
		if (altOnly && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			e.preventDefault();
			e.stopPropagation();
			const isDown = e.key === 'ArrowDown';
			const target = document.body;
			fire(
				target,
				isDown ? 'ArrowDown' : 'ArrowUp',
				isDown ? 'ArrowDown' : 'ArrowUp',
				isDown ? 40 : 38,
				{ ctrlKey: true, altKey: true }
			);
		}
	}, true);
}

function isquickVideoCallEntrypoint(url) {
	const possibleURLs = [
		/^https:\/\/chat.google.com\/*/,
		/^https:\/\/mail.google.com\/chat\/*/,
		/^https:\/\/mail.google.com\/mail\/u\/0\/#chat\/*/
	];
	return possibleURLs.some(possibleURL => possibleURL.test(url));
}

function decideEntrypoint() {
	url = location.href;
	if (isAutoJoinMeetEntrypoint(url)) {
		autoJoinMeetEntrypoint();
	}
	else if (isquickVideoCallEntrypoint(url)) {
		quickVideoCallEntrypoint();
		chatShortcutsEntrypoint();
	}
}
decideEntrypoint();
