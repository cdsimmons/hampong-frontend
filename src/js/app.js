// Libraries
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import 'nouislider/distribute/nouislider.css';
import { createGame } from './api';

// CSS
import '../scss/app.scss';

// Application
const cdnUrl = 'https://res.cloudinary.com/cdsimmons/image/upload/w_600/v1619138446/gift-recommender';

// const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Trying to figure out how best to localise currency and amazon links...
// If I do it custom, its only 20 sites that I have to take care of... I get country, then I just convert it top-level domain, and attach to amazon and should be fine... fallback to .com I guess

// Misc... should probably be shared between backend

// WEBP support
const get_support_format_webp = () => {
    var elem = document.createElement('canvas');

    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    } else {
        // very old browser like IE 8, canvas not supported
        return false;
    }
}
const support_format_webp = get_support_format_webp();
const imgExt = support_format_webp ? 'webp' : 'jpg';

if (!support_format_webp) {
    const $webpBackgrounds = $('.card__background');

    for (let i = 0; i < $webpBackgrounds.length; i++) {
        const $webpBackground = $($webpBackgrounds[i]);
        const background = $webpBackground.css('background-image');
        const jpgBackground = background.replace('.webp', '.jpg');
        $webpBackground.css('background-image', jpgBackground);
    }
}


// Templates...
const templates = {
    // choiceCard: $($('[data-template="choiceCard"]')[0]).remove(),
    // resultOther: $($('[data-template="resultOther"]')[0]).remove()
    modal: $($('[data-template="modal"]')[0]).remove()
}


// Globals...

// Page refresh...

const init = async () => {
    // const path = window.location.pathname.split('/');

    // if (!path.includes('profile')) {
    //     try {
    //         profile.country = await getCountryPublic();
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    await loadInitialPage();
}

const loadInitialPage = async () => {
    // Reload should show results/currentChoice
    const path = window.location.pathname.split('/');

    let foundPage = false;

    if (path.includes('rankings')) {
        // const profileId = path[path.length - 1];
        // rankings = await getProfile(profileId);
        switchToPage('rankings');

        foundPage = true;
    }

    if (!foundPage) {
        switchToPage('dashboard');
    }
}

const switchToPage = (key) => {
    $('[data-page]').removeClass('active');
    $('[data-page="'+key+'"]').addClass('active');
    $('[data-sitenav]').removeClass('active');
    $('[data-sitenav="'+key+'"]').addClass('active');

    window.scrollTo(0, 0);
}


// Match...
let startingPlayer = Math.round(Math.random());
let sets = [
    [
        [0, 0]
    ]
]

    // Match players...
$(document).on('change', '.match__player select', () => {
    const $emptyPlayers = $('.match__player option:selected[value=""]');
    const hasPlayers = $emptyPlayers.length === 0;

    if (hasPlayers) {
        $('.match__scores').addClass('active');
        setMatchScore(sets);
    } else {
        $('.match__scores').removeClass('active');
    }
});
    // Match score
$(document).on('click', '.match__scores.active .match__score.active', function() {
    const $this = $(this);
    const isFirst = $this.is(':first-child');

    const currentSet = sets[sets.length - 1];
    const currentScore = currentSet[currentSet.length - 1];
    const newScore = [currentScore[0], currentScore[1]];

    if (isFirst) {
        newScore[0] = newScore[0] + 1;
    } else {
        newScore[1] = newScore[1] + 1;
    }

    currentSet.push(newScore);

    setMatchScore(sets);
});
    // Match undo
$(document).on('click', '.match__scores.active .match__undo', () => {
    const currentSet = sets[sets.length - 1];
    if (currentSet.length > 1) {
        const currentScore = sets[sets.length - 1];
        currentScore.pop();
        setMatchScore(sets);
    }
});
    // Match rematch
$(document).on('click', '.match__scores.active .match__rematch.active', () => {
    const currentSet = sets[sets.length - 1];
    if (currentSet.length > 1) {
        sets.push([[0, 0]]);
        setMatchScore(sets);
    }
});
    // Match finish
$(document).on('click', '.match__scores.active .match__finish.active', () => {
    const $template = templates.modal.clone();
        
    const $heading = $template.find('[data-el="heading"]');
    const $body = $template.find('[data-el="body"]');
    const $actionPrimary = $template.find('[data-el="action-primary"]');
    const $actionSecondary = $template.find('[data-el="action-secondary"]');

    $heading.text('The End?');
    $body.text('It looks like you have finished playing, or maybe you would like a rematch...');
    $actionPrimary.text('Rematch');
    $actionSecondary.text('Finish');

    // Close
    $template.on('click', (e) => {
        if ($(e.target).hasClass('modal')) { // Sloppy check if background is clicked
            $template.remove();
        }
    });

    // Rematch
    $actionPrimary.on('click', () => {
        startingPlayer = startingPlayer === 0 ? 1 : 0;
        sets.push([[0, 0]]);
        setMatchScore(sets);
        $template.remove();
    });

    // End
    let submitting = false;
    $actionSecondary.on('click', async() => {
        if (!submitting) {
            submitting = true;
            const game = await createGame(sets, startingPlayer);
            document.location.reload(true);
        }
    });

    $('body').append($template);
    $template.addClass('active');
});


const setMatchScore = (sets) => {
    const $scoreNumbers = $('.match__score-number');
    const currentSet = sets[sets.length - 1];
    const currentScore = currentSet[currentSet.length - 1];

    $($scoreNumbers.get(0)).text(currentScore[0]);
    $($scoreNumbers.get(1)).text(currentScore[1]);

    if (currentSet.length > 1) {
        $('.match__players').removeClass('active');
    } else {
        $('.match__players').addClass('active');
    }

    // Serve...
    const rounds = currentSet.length - 1;
    const servingCount = Math.round((rounds + 1) % 2) + 1;
    const servingPlayer = Math.round(Math.round((rounds + 1) / 2) % 2) - 1 + startingPlayer;
    // 2, 1... 2, 1... repeats
    // 1 = 2
    // 2 = 1

    // rounds divided by 4...
    console.log(servingCount, servingPlayer);
    $('.match__score-serve').removeClass('active');
    $('.match__score-serve').text('');
    $($('.match__score-serve').get(servingPlayer)).addClass('active');
    $($('.match__score-serve').get(servingPlayer)).text(servingCount === 1 ? 'I' : 'II');


    // Finished?
    const playerOneWins = currentScore[0] >= 11 && currentScore[0] - currentScore[1] >= 2;
    const playerTwoWins = currentScore[1] >= 11 && currentScore[1] - currentScore[0] >= 2;
    const isFinished = playerOneWins || playerTwoWins;

    if (isFinished) {
        $('.match__score').removeClass('active');
    } else {
        $('.match__score').addClass('active');
    }

    if (isFinished || sets.length > 1) {
        $('.match__finish').addClass('active');
    } else {
        $('.match__finish').removeClass('active');
    }

    // Need to consider how to handle submission...
    // Lazy option is to submit every time rematch button is pressed, but that means sometimes people wont use it, or we cant do sets
    // Another option is to show a modal/alert box, which is like "Rematch" or "Finish"
    // Dialog is probably best...
    
}


init();