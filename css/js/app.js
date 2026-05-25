/* ============================================
   TALK VH — app.js
   All Logic: Modal, Payment, Bhadas, PWA
   ============================================ */

// ============================================
// CONFIG
// ============================================
const CONFIG = {
    upiId: "v.hardaha@oksbi",
    upiName: "TalkVH",
    adminEmail: "talkvh.help@gmail.com",
    appsScriptUrl: "" // Google Apps Script URL baad mein yahan daalna
};

// ============================================
// BOOKING MODAL — OPEN / CLOSE
// ============================================
function openBooking(planName, price) {
    document.getElementById("pName").innerText = planName;
    document.getElementById("pPrice").innerText = price;
    document.getElementById("formError").style.display = "none";
    document.getElementById("cName").value = "";
    document.getElementById("cContact").value = "";
    document.getElementById("cTopic").selectedIndex = 0;
    document.getElementById("bookingModal").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeBooking() {
    document.getElementById("bookingModal").classList.remove("open");
    document.body.style.overflow = "";
}

// ============================================
// FREE TRIAL MODAL — OPEN / CLOSE
// ============================================
function openFree() {
    document.getElementById("freeError").style.display = "none";
    document.getElementById("freeName").value = "";
    document.getElementById("freePhone").value = "";
    document.getElementById("freeSuccess").style.display = "none";
    document.getElementById("freeModal").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeFree() {
    document.getElementById("freeModal").classList.remove("open");
    document.body.style.overflow = "";
}

// ============================================
// FREE TRIAL — SUBMIT
// ============================================
function submitFree() {
    const name  = document.getElementById("freeName").value.trim();
    const phone = document.getElementById("freePhone").value.trim();
    const err   = document.getElementById("freeError");

    // Validation
    if (!name || phone.length < 10) {
        err.style.display = "block";
        return;
    }
    err.style.display = "none";

    // Apps Script ko data bhejo (agar URL set hai)
    if (CONFIG.appsScriptUrl) {
        const data = {
            type: "FREE_TRIAL",
            name: name,
            phone: phone,
            timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        };

        fetch(CONFIG.appsScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).catch(() => {}); // silently fail — sheet baad mein bhi manual update ho sakti hai
    }

    // Success dikhao
    document.getElementById("freeSuccess").style.display = "block";

    // Buttons hide karo
    document.querySelector("#freeModal .btn-solid").style.display = "none";
}

// ============================================
// PAYMENT — PAY NOW
// ============================================
function payNow() {
    const name    = document.getElementById("cName").value.trim();
    const contact = document.getElementById("cContact").value.trim();
    const price   = document.getElementById("pPrice").innerText;
    const plan    = document.getElementById("pName").innerText;
    const topic   = document.getElementById("cTopic").value;
    const err     = document.getElementById("formError");

    // Validation
    if (!name) {
        err.style.display = "block";
        err.innerText = "कृपया नाम लिखें!";
        return;
    }
    err.style.display = "none";

    // UPI Deep Link
    const note   = "TalkVH_" + name.replace(/\s/g, "_").substring(0, 20);
    const upiUrl = `upi://pay?pa=${CONFIG.upiId}&pn=${encodeURIComponent(CONFIG.upiName)}&am=${price}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Modal band karo
    closeBooking();

    // UPI app kholo
    window.location.href = upiUrl;

    // 4 second baad success screen dikhao
    setTimeout(() => {
        showSuccess(name, contact, plan, price, topic);
    }, 4000);
}

// ============================================
// SUCCESS SCREEN — SHOW / CLOSE
// ============================================
function showSuccess(name, contact, plan, price, topic) {
    document.getElementById("successScreen").classList.add("open");
    document.body.style.overflow = "hidden";

    // Apps Script ko data bhejo
    if (CONFIG.appsScriptUrl) {
        const data = {
            type: "BOOKING",
            name: name,
            contact: contact || "Not provided",
            plan: plan,
            amount: price,
            topic: topic,
            timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        };

        fetch(CONFIG.appsScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).catch(() => {});
    }
}

function closeSuccess() {
    document.getElementById("successScreen").classList.remove("open");
    document.body.style.overflow = "";
}

// ============================================
// BHADAS BOX — BURN ANIMATION 🔥
// ============================================
function burnIt() {
    const text     = document.getElementById("bhadasText").value.trim();
    const overlay  = document.getElementById("fireOverlay");
    const burnBtn  = document.getElementById("burnBtn");
    const success  = document.getElementById("burnSuccess");
    const textarea = document.getElementById("bhadasText");

    if (!text) {
        textarea.placeholder = "पहले कुछ लिखो तो... 😄";
        textarea.focus();
        return;
    }

    // Fire overlay ON
    overlay.classList.add("active");
    burnBtn.disabled = true;
    burnBtn.innerText = "🔥 जल रहा है...";

    // Fire particles banao
    spawnFireParticles(textarea);

    // Text slowly hatao
    let opacity = 1;
    const fadeText = setInterval(() => {
        opacity -= 0.08;
        textarea.style.opacity = opacity;
        if (opacity <= 0) {
            clearInterval(fadeText);
            textarea.value = "";
            textarea.style.opacity = 1;
        }
    }, 60);

    // 2 second baad — sab khatam, success dikhao
    setTimeout(() => {
        overlay.classList.remove("active");
        burnBtn.style.display = "none";
        textarea.style.display = "none";
        success.style.display = "block";
    }, 2000);
}

// Fire particles spawn karo
function spawnFireParticles(element) {
    const rect    = element.getBoundingClientRect();
    const wrapper = element.parentElement;
    const colors  = ["#ff3c00", "#ff7a00", "#ffb300", "#ff5500", "#ff9500"];

    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "fire-particle";
            p.style.left            = Math.random() * 90 + "%";
            p.style.bottom          = "10px";
            p.style.background      = colors[Math.floor(Math.random() * colors.length)];
            p.style.width           = (6 + Math.random() * 8) + "px";
            p.style.height          = (6 + Math.random() * 8) + "px";
            p.style.animationDelay  = (Math.random() * 0.4) + "s";
            p.style.animationDuration = (0.6 + Math.random() * 0.5) + "s";
            wrapper.appendChild(p);

            // Remove after animation
            setTimeout(() => p.remove(), 1200);
        }, i * 60);
    }
}

// ============================================
// CLOSE MODALS ON BACKDROP CLICK
// ============================================
document.addEventListener("DOMContentLoaded", () => {

    // Booking modal backdrop
    document.getElementById("bookingModal").addEventListener("click", function(e) {
        if (e.target === this) closeBooking();
    });

    // Free modal backdrop
    document.getElementById("freeModal").addEventListener("click", function(e) {
        if (e.target === this) closeFree();
    });

    // ESC key se close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeBooking();
            closeFree();
        }
    });

    // Phone number — sirf numbers
    const phoneInput = document.getElementById("freePhone");
    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            phoneInput.value = phoneInput.value.replace(/\D/g, "").substring(0, 10);
        });
    }

});

// ============================================
// PWA — SERVICE WORKER
// ============================================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(reg  => console.log("✅ SW Registered", reg))
            .catch(err => console.log("❌ SW Failed", err));
    });
}
