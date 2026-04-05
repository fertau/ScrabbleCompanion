var Dictionary = (function () {
    var _words = null;
    var _loaded = false;

    function normalize(word) {
        return word.normalize('NFC').trim().toLowerCase();
    }

    return {
        async load() {
            var response = await fetch('data/words.txt');
            var text = await response.text();
            var lines = text.split('\n').filter(function (w) { return w.length > 0; });
            _words = new Set(lines);
            _loaded = true;
        },

        isValid: function (word) {
            if (!_loaded) return false;
            return _words.has(normalize(word));
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
