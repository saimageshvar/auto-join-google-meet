function start() {
	url = location.href;
	if (url.includes("meet.google.com")) {
		its_meet();
	}
}

function its_meet() {
	const interval = setInterval(function() {
		try {
			const joinNowElement = [...document.querySelectorAll("span")].find((ele) => ele.textContent === "Join now");
			const divs = [...document.querySelectorAll('div')];
			const noParticipants = divs.find(e => e.textContent === "No one else is here");
			const someoneIsPresent = divs.find(e => e.textContent.match(/in this call/));
			if(joinNowElement){
        const turnOffVideo = document.querySelector('div[aria-label="Turn off camera (ctrl + e)"]');
				if(turnOffVideo) {
					turnOffVideo.click();
				}
				if(!noParticipants && someoneIsPresent){
					joinNowElement.click();
					clearInterval(interval);
				}
      }
		} catch (err) {
			console.log("Error", err);
		}
	}, 2000)
}
start();