(() => {
  const listEl = document.getElementById("list");
  const emptyStateEl = document.getElementById("emptyState");
  const glideHintEl = document.getElementById("glideHint");
  const resolveBtn = document.getElementById("resolveBtn");
  const resetBtn = document.getElementById("resetBtn");

  const initialHTML = listEl.innerHTML;

  // notifId -> resolved, true means card is already cleared
  const cardResolved = new Map();

  let activeBtnEl = null;
  let gliding = false;
  let pointerId = null;
  let lastActionKey = null;

  const getActionKey = (notifId, action) => `${notifId}:${action}`;

  const updateEmptyState = () => {
    const remaining = listEl.querySelectorAll(".card").length;
    const isEmpty = remaining === 0;
    emptyStateEl.classList.toggle("hidden", !isEmpty);
    emptyStateEl.setAttribute("aria-hidden", String(!isEmpty));
  };

  const resolveNotification = (notifId, action) => {
    if (cardResolved.get(notifId)) return;

    const cardEl = listEl.querySelector(`.card[data-id="${notifId}"]`);
    if (!cardEl) return;

    cardResolved.set(notifId, true);
    cardEl.dataset.resolvedAction = action;
    cardEl.classList.add("resolved");
    cardEl.style.pointerEvents = "none";

    // After the fade/slide, remove the card
    window.setTimeout(() => {
      if (cardEl.isConnected) cardEl.remove();
      updateEmptyState();
    }, 240);
  };

  const clearAll = () => {
    const cards = Array.from(listEl.querySelectorAll(".card"));
    for (const cardEl of cards) {
      const notifId = cardEl.dataset.id;
      // Demo defaults:
      // - email/text: delete
      // - reminder/alarm: reset
      let action = "delete";
      if (notifId === "alarm" || notifId === "reminder") action = "reset";
      resolveNotification(notifId, action);
    }
  };

  const resetDemo = () => {
    listEl.innerHTML = initialHTML;
    cardResolved.clear();
    activeBtnEl?.classList.remove("active");
    activeBtnEl = null;
    lastActionKey = null;
    gliding = false;
    pointerId = null;

    if (glideHintEl) glideHintEl.classList.remove("active");
    emptyStateEl.classList.add("hidden");
    emptyStateEl.setAttribute("aria-hidden", "true");
  };

  const findClosestActionBtn = (target) => {
    const btn = target && target.closest ? target.closest(".actionBtn") : null;
    if (!btn) return null;
    return listEl.contains(btn) ? btn : null;
  };

  const onPointerDown = (e) => {
    // Only left mouse button / touch / pen
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!emptyStateEl.classList.contains("hidden")) return;

    gliding = true;
    pointerId = e.pointerId;
    lastActionKey = null;

    if (glideHintEl) {
      glideHintEl.classList.add("active");
      glideHintEl.textContent = "Glide over options to resolve";
    }

    // Immediately resolve the option under the pointer if there is one
    const btn = findClosestActionBtn(e.target);
    if (btn) {
      const notifId = btn.dataset.notif;
      const action = btn.dataset.action;

      activeBtnEl?.classList.remove("active");
      activeBtnEl = btn;
      btn.classList.add("active");

      lastActionKey = getActionKey(notifId, action);
      resolveNotification(notifId, action);
    }

    try {
      listEl.setPointerCapture(pointerId);
    } catch {
      // Ignore pointer capture failures
    }

    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!gliding) return;

    const underPointer = document.elementFromPoint(e.clientX, e.clientY);
    const btn = findClosestActionBtn(underPointer);
    if (!btn) {
      activeBtnEl?.classList.remove("active");
      activeBtnEl = null;
      return;
    }

    const notifId = btn.dataset.notif;
    const action = btn.dataset.action;
    const key = getActionKey(notifId, action);

    if (activeBtnEl !== btn) {
      activeBtnEl?.classList.remove("active");
      activeBtnEl = btn;
      btn.classList.add("active");
    }

    if (lastActionKey !== key) {
      lastActionKey = key;
      resolveNotification(notifId, action);
    }

    e.preventDefault();
  };

  const endGlide = () => {
    gliding = false;
    pointerId = null;
    lastActionKey = null;
    activeBtnEl?.classList.remove("active");
    activeBtnEl = null;
    if (glideHintEl) glideHintEl.classList.remove("active");
  };

  const onClick = (e) => {
    const btn = findClosestActionBtn(e.target);
    if (!btn) return;
    const notifId = btn.dataset.notif;
    const action = btn.dataset.action;
    resolveNotification(notifId, action);
  };

  // Init state
  cardResolved.clear();
  updateEmptyState();
  if (glideHintEl) glideHintEl.classList.remove("active");

  listEl.addEventListener("pointerdown", onPointerDown, { passive: false });
  listEl.addEventListener("pointermove", onPointerMove, { passive: false });
  listEl.addEventListener("pointerup", endGlide, { passive: true });
  listEl.addEventListener("pointercancel", endGlide, { passive: true });
  listEl.addEventListener("pointerleave", endGlide, { passive: true });

  // Optional support for mouse click/tap on a specific button
  listEl.addEventListener("click", onClick);

  // Optional clear all button if user adds it
  if (resolveBtn) resolveBtn.addEventListener("click", clearAll);
  resetBtn.addEventListener("click", resetDemo);
})();

