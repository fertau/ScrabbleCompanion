var UI = (function () {
    // Spanish Scrabble tile values
    var TILE_VALUES = {
        'a': 1, 'e': 1, 'o': 1, 's': 1, 'i': 1,
        'u': 1, 'n': 1, 'l': 1, 'r': 1, 't': 1,
        'd': 2, 'g': 2,
        'b': 3, 'c': 3, 'm': 3, 'p': 3,
        'f': 4, 'h': 4, 'v': 4, 'y': 4,
        'q': 5,
        'j': 8, 'x': 8,
        'z': 10,
        // Accented vowels and ñ/ü count as their base letter value
        'á': 1, 'é': 1, 'í': 1, 'ó': 1, 'ú': 1, 'ü': 1,
        'ñ': 8
    };

    function getLetterValue(letter) {
        return TILE_VALUES[letter.toLowerCase()] || 0;
    }

    function calculateScore(word) {
        var score = 0;
        var normalized = word.normalize('NFC').toLowerCase();
        for (var i = 0; i < normalized.length; i++) {
            score += getLetterValue(normalized[i]);
        }
        return score;
    }

    function createTilesHTML(word) {
        var normalized = word.normalize('NFC').toLowerCase();
        var html = '';
        for (var i = 0; i < normalized.length; i++) {
            var letter = normalized[i];
            var value = getLetterValue(letter);
            html += '<span class="tile">' +
                letter.toUpperCase() +
                '<span class="tile-points">' + value + '</span>' +
                '</span>';
        }
        return html;
    }

    var elements = {};

    return {
        init: function () {
            elements.form = document.getElementById('search-form');
            elements.input = document.getElementById('word-input');
            elements.result = document.getElementById('result');
            elements.wordCount = document.getElementById('word-count');
            elements.loading = document.getElementById('loading-overlay');

            elements.form.addEventListener('submit', function (e) {
                e.preventDefault();
                var word = elements.input.value.trim();
                if (word.length === 0) return;
                UI.showResult(word);
            });
        },

        showLoading: function () {
            elements.loading = document.getElementById('loading-overlay');
            elements.loading.classList.remove('hidden');
        },

        hideLoading: function () {
            elements.loading = document.getElementById('loading-overlay');
            elements.loading.classList.add('hidden');
        },

        showResult: function (word) {
            var isValid = Dictionary.isValid(word);
            var score = calculateScore(word);
            var statusClass = isValid ? 'valid' : 'invalid';
            var statusText = isValid ? 'Palabra Válida' : 'Palabra No Válida';
            var badgeText = isValid ? 'Aceptada en Scrabble' : 'No encontrada en el diccionario';

            var html = '<div class="result-word">' + createTilesHTML(word) + '</div>';
            html += '<div class="result-status ' + statusClass + '">' + statusText + '</div>';
            html += '<div class="result-badge ' + statusClass + '">' + badgeText + '</div>';

            if (isValid) {
                html += '<div class="result-score">Puntaje: <strong>' + score + '</strong> puntos</div>';
                html += '<a href="' + Dictionary.getRAEUrl(word) + '" target="_blank" rel="noopener noreferrer" class="rae-link">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>' +
                    'Ver definición en RAE' +
                    '</a>';
            }

            elements.result.innerHTML = html;
            elements.result.classList.remove('hidden');
            elements.result.style.animation = 'none';
            elements.result.offsetHeight; // force reflow
            elements.result.style.animation = '';
        },

        updateWordCount: function () {
            var count = Dictionary.getWordCount();
            elements.wordCount = document.getElementById('word-count');
            elements.wordCount.textContent = count.toLocaleString('es-ES') + ' palabras en el diccionario';
        }
    };
})();
