let color;
let dif = 255;
let guess_timer;
let win_timer;
let g_anim;
let won = false;
let clicks = 0;
let wins = 0;

const win_sound = new Audio('assets/win.mp3');
const wrong_sound = new Audio('assets/wrong.mp3');

const circles = document.getElementsByClassName('color-circle');
const cookie_name = 'gtcgame';

const win_msg = ['Well done!', 'Good job!', 'So smart!'];
const encouraging = ['Don\'t give up.', 'Never give up.', 'You can do it.'];

// random in a range
function rand(l = 0, u = 1) {
    return Math.random() * u + l;
}

// random color generator
function random_color(base, dif) {
    let min_dif = dif / 2;
    let max_dif = dif;

    let c = [];

    base.forEach((v, i) => {
        let x = rand(-min_dif, max_dif);
        x = Math.floor(255 - x < 0 ? 255 + (255 - x) : x);

        c[i] = Math.min(Math.max(v + x, 0), 255);
    });

    return c;
}

// deep comparison of 2 arrays
function deep_compare(a, base) {
    for (var i = 0; i < a.length; i++)
        if (a[i] != base[i])
            return false;
    return true;
}

function randomize_colors() {
    color = [Math.floor(rand(0, 255)), Math.floor(rand(0, 255)), Math.floor(rand(0, 255))];
    let circle = Math.floor(rand(0, 5));

    for (index in circles)
        if (circles.hasOwnProperty(index)) {
            const element = circles[index];

            if (index == circle)
                element.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            else {
                let new_color;
                do {
                    new_color = random_color(color, dif);

                    element.style.backgroundColor = `rgb(${new_color[0]}, ${new_color[1]}, ${new_color[2]})`;
                } while (deep_compare(new_color, color));
            }
        }

    document.getElementById('color-code').innerHTML = `(<span class="red">${color[0]}</span>, <span class="green">${color[1]}</span>, <span class="blue">${color[2]}</span>)`;
}

function verify_color() {
    if (won) return

    clicks++;

    const g = document.getElementById('guess');
    if (deep_compare(this.style.backgroundColor.slice(4, -1).split(', '), color)) {
        g.innerHTML = win_msg[Math.floor(rand(0, win_msg.length))];

        full_anim();
        win_sound.play();

        won = true;
        wins++;

        if (win_timer != undefined) clearTimeout(win_timer);

        // wait 1s until the animation ends and randomize colors
        dif = Math.max(dif - 1, 8);
        win_timer = setTimeout(function () {
            randomize_colors();
            document.getElementById('difficulty').innerHTML = 255 - dif;
            won = false;
        }, 1000);

    } else {
        text_anim();
        wrong_sound.play();
        g.innerHTML = encouraging[Math.floor(rand(0, encouraging.length))];
    }

    document.getElementById('win-rate').innerHTML = Math.round(wins / clicks * 100);

    // resets text after 1s
    if (guess_timer != undefined) clearTimeout(guess_timer);
    guess_timer = setTimeout(function () {
        g.innerHTML = 'Guess the color';
    }, 1000);

    update_cookie();
    update_gameinfo();
}

// cheat functions
function log_colors() {
    for (index in circles)
        if (circles.hasOwnProperty(index))
            console.log(parseInt(index) + 1, circles[index].style.backgroundColor);
}

function log_answers() {
    for (index in circles)
        if (circles.hasOwnProperty(index))
            if (deep_compare(circles[index].style.backgroundColor.slice(4, -1).split(', '), color))
                console.log(parseInt(index) + 1);
}

// animation functions
function text_anim() {
    if (g_anim != undefined)
        clearTimeout(g_anim);

    document.getElementById('guess').style.transform = 'scale(1.1)';
    g_anim = setTimeout(function () {
        document.getElementById('guess').style.transform = '';
    }, 1000);
}

function full_anim() {
    for (index in circles)
        if (circles.hasOwnProperty(index)) {
            const element = circles[index];
            setTimeout(function () {
                element.style.borderRadius = '16px';
                setTimeout(function () {
                    element.style.borderRadius = '';
                }, 200);
            }, index * 200);
        }

    text_anim();
}

function update_gameinfo() {
    if (document.cookie == '') return;
    // load cookie
    let cookie = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)gtcgame\s*\=\s*([^;]*).*$)|^.*$/, '$1'));

    wins = cookie.wins || 0;
    clicks = cookie.clicks || 0;
    dif = cookie.dif || 255;

    document.getElementById('difficulty').innerHTML = 255 - dif;
    document.getElementById('win-rate').innerHTML = Math.round(wins / clicks * 100) || '??';
}

function update_cookie() {
    document.cookie = `${cookie_name}=${JSON.stringify({ dif: dif, clicks: clicks, wins: wins })}`;
}

// add event listeners
function init() {
    // on reset
    document.getElementById('reset').onclick = function () {
        dif = 255;
        clicks = 0;
        wins = 0;
        update_cookie();
        update_gameinfo();
        randomize_colors();
    }

    // click on the circle to toggle verification
    document.body.onload = randomize_colors;
    document.getElementById('difficulty').innerHTML = 255 - dif;
    for (index in circles)
        if (circles.hasOwnProperty(index))
            circles[index].onclick = verify_color;

    // press a number between 1-5 to toggle verification
    document.addEventListener('keydown', function (event) {
        let circle = document.getElementById(event.key);
        if (circle != undefined)
            verify_color.call(circle);
    });

    update_gameinfo();
}