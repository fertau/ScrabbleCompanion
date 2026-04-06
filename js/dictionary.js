var Dictionary = (function () {
    var _words = null;
    var _loaded = false;

    // Valid Spanish Scrabble characters: a-z, accented vowels, ñ
    var VALID_CHARS = /^[a-záéíóúüñ]+$/;
    var MIN_LENGTH = 2;
    var MAX_LENGTH = 15;

    function normalize(word) {
        return word.normalize('NFC').trim().toLowerCase();
    }

    /**
     * Check Scrabble rules before dictionary lookup.
     * Returns { valid: true } or { valid: false, reason: string }
     */
    function checkRules(word) {
        if (word.length < MIN_LENGTH) {
            return { valid: false, reason: 'La palabra debe tener al menos ' + MIN_LENGTH + ' letras' };
        }
        if (word.length > MAX_LENGTH) {
            return { valid: false, reason: 'La palabra no puede tener más de ' + MAX_LENGTH + ' letras' };
        }
        if (!VALID_CHARS.test(word)) {
            return { valid: false, reason: 'Solo se permiten letras del alfabeto español (sin números, guiones ni símbolos)' };
        }
        return { valid: true };
    }

    return {
        async load() {
            var response = await fetch('data/words.txt');
            var text = await response.text();
            var lines = text.split('\n').filter(function (w) { return w.length > 0; });
            _words = new Set(lines);
            _loaded = true;
        },

        /**
         * Validate a word. Returns:
         *   { valid: true, inDictionary: true }
         *   { valid: false, reason: string, ruleViolation: true }  — failed Scrabble rules
         *   { valid: false, reason: string, ruleViolation: false } — not in dictionary
         */
        validate: function (word) {
            if (!_loaded) return { valid: false, reason: 'Diccionario no cargado', ruleViolation: false };

            var normalized = normalize(word);
            var rules = checkRules(normalized);
            if (!rules.valid) {
                return { valid: false, reason: rules.reason, ruleViolation: true };
            }

            var inDict = _words.has(normalized);
            if (inDict) {
                return { valid: true, inDictionary: true };
            }
            return { valid: false, reason: 'No encontrada en el diccionario', ruleViolation: false };
        },

        // Keep backward compat
        isValid: function (word) {
            return this.validate(word).valid;
        },

        isLoaded: function () {
            return _loaded;
        },

        getWordCount: function () {
            return _words ? _words.size : 0;
        },

        getRAEUrl: function (word) {
            return 'https://dle.rae.es/' + encodeURIComponent(normalize(word));
        }
    };
})();
