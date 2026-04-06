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
            html += '<span class="tile" style="--i:' + i + '">' +
                letter.toUpperCase() +
                '<span class="tile-points">' + value + '</span>' +
                '</span>';
        }
        return html;
    }

    function renderDefinitions(entries) {
        var html = '';
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.title) {
                html += '<div class="def-title">' + escapeHtml(entry.title) + '</div>';
            }
            html += '<ol class="def-list">';
            for (var j = 0; j < entry.definitions.length; j++) {
                html += '<li>' + escapeHtml(entry.definitions[j]) + '</li>';
            }
            html += '</ol>';
        }
        return html;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
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
            var result = Dictionary.validate(word);
            var isValid = result.valid;
            var score = calculateScore(word);
            var statusClass = isValid ? 'valid' : 'invalid';
            var statusText = isValid ? 'Palabra Valida' : 'Palabra No Valida';
            var checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            var crossIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            var badgeIcon = isValid ? checkIcon : crossIcon;
            var badgeText = isValid ? 'Aceptada en Scrabble' : (result.reason || 'No encontrada en el diccionario');

            var html = '<div class="result-word">' + createTilesHTML(word) + '</div>';
            html += '<div class="result-status ' + statusClass + '">' + statusText + '</div>';
            html += '<div class="result-badge ' + statusClass + '">' + badgeIcon + ' ' + badgeText + '</div>';

            // Show rule violation hint if applicable
            if (!isValid && result.ruleViolation) {
                html += '<div class="result-rule-hint">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> ' +
                    'Regla oficial de Scrabble</div>';
            }

            if (isValid) {
                html += '<div class="result-score">Puntaje: <strong>' + score + '</strong> puntos</div>';

                // RAE verification badge placeholder
                html += '<div class="rae-verify-status" id="rae-verify-status"></div>';

                // Definition dropdown
                html += '<details class="def-dropdown" id="def-dropdown">';
                html += '<summary class="def-toggle">';
                html += '<svg class="def-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
                html += 'Definición RAE';
                html += '<svg class="def-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
                html += '</summary>';
                html += '<div class="def-content" id="def-content">';
                html += '<div class="def-loading"><span class="def-spinner"></span> Cargando definición...</div>';
                html += '</div>';
                html += '</details>';

                // Fallback link to RAE
                html += '<a href="' + Dictionary.getRAEUrl(word) + '" target="_blank" rel="noopener noreferrer" class="rae-link rae-link-small">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>' +
                    'Abrir en dle.rae.es' +
                    '</a>';
            }

            elements.result.innerHTML = html;
            elements.result.classList.remove('hidden');
            elements.result.style.animation = 'none';
            elements.result.offsetHeight;
            elements.result.style.animation = '';

            // Show RAE verification status from cache
            if (isValid) {
                var verifyEl = document.getElementById('rae-verify-status');
                RAE.isVerified(word).then(function (status) {
                    if (status === true) {
                        verifyEl.innerHTML = '<span class="rae-verified">' + checkIcon + ' Verificada en RAE</span>';
                    }
                    // null = not checked yet, don't show anything
                });
            }

            // Fetch definition when valid
            if (isValid) {
                var dropdown = document.getElementById('def-dropdown');
                var defContent = document.getElementById('def-content');
                var fetched = false;

                dropdown.addEventListener('toggle', function () {
                    if (dropdown.open && !fetched) {
                        fetched = true;
                        RAE.fetch(word)
                            .then(function (data) {
                                defContent.innerHTML = renderDefinitions(data.entries);
                                // Update verification badge after successful fetch
                                var vEl = document.getElementById('rae-verify-status');
                                if (vEl && data.verified) {
                                    vEl.innerHTML = '<span class="rae-verified">' + checkIcon + ' Verificada en RAE</span>';
                                }
                                if (data.cached) {
                                    defContent.innerHTML += '<div class="def-cached-note">Definición guardada localmente</div>';
                                }
                            })
                            .catch(function () {
                                defContent.innerHTML =
                                    '<div class="def-error">' +
                                    'RAE no disponible en este momento. ' +
                                    '<a href="' + Dictionary.getRAEUrl(word) + '" target="_blank" rel="noopener noreferrer">Ver en dle.rae.es</a>' +
                                    '</div>';
                            });
                    }
                });
            }
        },

        updateWordCount: function () {
            var count = Dictionary.getWordCount();
            elements.wordCount = document.getElementById('word-count');
            elements.wordCount.textContent = count.toLocaleString('es-ES') + ' palabras en el diccionario';
        }
    };
})();
