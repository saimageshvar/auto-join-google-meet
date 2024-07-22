function autoJoinMeetEntrypoint() {
	const interval = setInterval(function () {
		try {
			const joinNowElement = [...document.querySelectorAll("span")].find((ele) => ele.textContent === "Join now");
			const divs = [...document.querySelectorAll('div')];
			const noParticipants = divs.find(e => e.textContent === "No one else is here");
			const someoneIsPresent = divs.find(e => e.textContent.match(/in this call/));
			if (joinNowElement) {
				const turnOffVideo = selectElementsByAriaLabel("turn off camera");
				[...turnOffVideo].map(e => e.click())
				// if (turnOffVideo) {
				// 	turnOffVideo.click();
				// }
				if (!noParticipants && someoneIsPresent) {
					joinNowElement.click();
					clearInterval(interval);
				}
			}
		} catch (err) {
			console.log("Error", err);
		}
	}, 2000);
}

function selectElementsByAriaLabel(pattern) {
  const regex = new RegExp(pattern, 'i'); // 'i' flag for case-insensitive
  const allElements = document.querySelectorAll('div[aria-label]');
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
	}
}
decideEntrypoint();
