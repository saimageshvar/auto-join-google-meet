(function () {
  function injectApprovalCounts() {
    document.querySelectorAll('[id^="issue_"]').forEach(row => {
      if (row.dataset.approvalsInjected) return;
      const reviewLink = row.querySelector('a[aria-label*="review approval"]');
      if (!reviewLink) return;
      const aria = reviewLink.getAttribute('aria-label') || '';
      const match = aria.match(/^(\d+) review approval/);
      if (!match) return;
      const count = match[1];
      const badge = document.createElement('span');
      badge.textContent = count + ' ✓ ';
      badge.style.cssText = 'font-weight:bold;color:#1a7f37;margin-right:2px;';
      reviewLink.insertBefore(badge, reviewLink.firstChild);
      row.dataset.approvalsInjected = 'true';
    });
  }

  injectApprovalCounts();

  document.addEventListener('turbo:load', injectApprovalCounts);

  const observer = new MutationObserver(injectApprovalCounts);
  observer.observe(document.body, { childList: true, subtree: true });
})();
