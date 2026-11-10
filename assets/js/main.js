/* Senddora — site behaviour (no dependencies) */
(function () {
  "use strict";

  var SUPPORT_EMAIL = "support@senddora.in";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var params = new URLSearchParams(window.location.search);

  /* ---------- Offer filters ---------- */
  var filterBtns = document.querySelectorAll("[data-filter]");
  if (filterBtns.length) {
    var items = document.querySelectorAll("[data-category]");
    var countEl = document.querySelector("[data-offer-count]");
    var applyFilter = function (cat, updateUrl) {
      var valid = Array.prototype.some.call(filterBtns, function (b) { return b.dataset.filter === cat; });
      if (!valid) cat = "all";
      var shown = 0;
      filterBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b.dataset.filter === cat ? "true" : "false");
      });
      items.forEach(function (item) {
        var match = cat === "all" || item.dataset.category === cat;
        item.hidden = !match;
        if (match) shown += item.dataset.count === undefined ? 1 : Number(item.dataset.count);
      });
      if (countEl) {
        countEl.textContent = shown === 1 ? "Showing 1 offer" : "Showing " + shown + " offers";
      }
      if (updateUrl && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (cat === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", cat);
        window.history.replaceState(null, "", url.toString());
      }
    };
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () { applyFilter(b.dataset.filter, true); });
    });
    applyFilter(params.get("cat") || "all", false);
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var topicSelect = form.querySelector("#topic");
  var groups = form.querySelectorAll("[data-topic-group]");
  var successPanel = document.getElementById("form-success");
  var previewEl = document.getElementById("message-preview");
  var copyBtn = document.getElementById("copy-message");
  var copyStatus = document.getElementById("copy-status");
  var reopenLink = document.getElementById("reopen-mail");
  var editBtn = document.getElementById("edit-message");

  var TOPIC_LABELS = {
    cashback: "Cashback claim",
    withdrawal: "Withdrawal request",
    dlt: "TRAI DLT services",
    general: "General question",
    privacy: "Privacy or data request"
  };

  var showGroups = function () {
    var topic = topicSelect.value;
    groups.forEach(function (g) {
      var on = g.dataset.topicGroup.split(" ").indexOf(topic) !== -1;
      g.hidden = !on;
      g.querySelectorAll("input, select, textarea").forEach(function (f) { f.disabled = !on; });
    });
  };

  // Prefill from URL (e.g. contact.html?topic=dlt&service=header)
  var allowedTopics = Object.keys(TOPIC_LABELS);
  var qTopic = params.get("topic");
  if (qTopic && allowedTopics.indexOf(qTopic) !== -1) topicSelect.value = qTopic;
  var qService = params.get("service");
  var serviceSelect = form.querySelector("#service");
  if (qService && serviceSelect) {
    Array.prototype.forEach.call(serviceSelect.options, function (o) {
      if (o.value === qService) serviceSelect.value = qService;
    });
  }
  var qOffer = params.get("offer");
  var offerInput = form.querySelector("#offer");
  if (qOffer && offerInput) offerInput.value = qOffer.slice(0, 80);

  topicSelect.addEventListener("change", showGroups);
  showGroups();

  var setError = function (field, msg) {
    var wrap = field.closest(".field") || field.closest(".check");
    if (!wrap) return;
    var err = wrap.querySelector(".field-error");
    wrap.classList.toggle("has-error", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
  };

  var validateField = function (field) {
    if (field.disabled) return true;
    var v = (field.type === "checkbox") ? field.checked : field.value.trim();
    var msg = "";
    if (field.required && !v) {
      msg = field.type === "checkbox" ? "Please tick this box to continue." : "This field is required.";
    } else if (field.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg = "Please enter a valid email address.";
    } else if (field.type === "tel" && v && !/^[+0-9 ()-]{8,16}$/.test(v)) {
      msg = "Please enter a valid phone number.";
    } else if (field.maxLength > 0 && typeof v === "string" && v.length > field.maxLength) {
      msg = "Please keep this under " + field.maxLength + " characters.";
    }
    setError(field, msg);
    return !msg;
  };

  form.querySelectorAll("input, select, textarea").forEach(function (f) {
    f.addEventListener("blur", function () { validateField(f); });
    f.addEventListener("input", function () {
      if (f.getAttribute("aria-invalid") === "true") validateField(f);
    });
  });

  var val = function (id) {
    var el = form.querySelector("#" + id);
    return el && !el.disabled ? el.value.trim() : "";
  };
  var optText = function (id) {
    var el = form.querySelector("#" + id);
    if (!el || el.disabled || !el.value) return "";
    return el.options[el.selectedIndex].text;
  };

  var buildMessage = function () {
    var topic = topicSelect.value;
    var lines = [];
    var add = function (label, value) { if (value) lines.push(label + ": " + value); };
    add("Topic", TOPIC_LABELS[topic]);
    add("Name", val("name"));
    add("Email", val("email"));
    add("Phone", val("phone"));
    if (topic === "cashback") {
      add("Offer", val("offer"));
      add("Store / website", val("store"));
      add("Order ID", val("order-id"));
      add("Order date", val("order-date"));
    }
    if (topic === "withdrawal") {
      add("Claim reference", val("claim-ref"));
      add("Preferred payout method", optText("payout"));
    }
    if (topic === "dlt") {
      add("Business name", val("business"));
      add("Service needed", optText("service"));
    }
    lines.push("");
    lines.push(val("message"));
    var subject = "[Senddora] " + TOPIC_LABELS[topic] + " - " + val("name");
    return { subject: subject, body: lines.join("\n") };
  };

  var mailtoFor = function (msg) {
    return "mailto:" + SUPPORT_EMAIL +
      "?subject=" + encodeURIComponent(msg.subject) +
      "&body=" + encodeURIComponent(msg.body);
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll("input, select, textarea");
    var firstBad = null;
    fields.forEach(function (f) {
      if (!validateField(f) && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }
    var msg = buildMessage();
    var href = mailtoFor(msg);
    previewEl.textContent = "Subject: " + msg.subject + "\n\n" + msg.body;
    reopenLink.setAttribute("href", href);
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
    window.location.href = href;
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = "To: " + SUPPORT_EMAIL + "\n" + previewEl.textContent;
      var done = function () { copyStatus.textContent = "Copied. Paste it into an email to " + SUPPORT_EMAIL + "."; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); }
    catch (err) { copyStatus.textContent = "Please select the text above and copy it manually."; }
    document.body.removeChild(ta);
  }

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      successPanel.hidden = true;
      form.hidden = false;
      copyStatus.textContent = "";
      form.querySelector("#name").focus();
    });
  }
})();
