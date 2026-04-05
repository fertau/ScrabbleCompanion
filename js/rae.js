var RAE = (function () {
    var PROXY_URL = 'https://api.allorigins.win/raw?url=';

    function buildUrl(word) {
        var normalized = word.normalize('NFC').trim().toLowerCase();
        return PROXY_URL + encodeURIComponent('https://dle.rae.es/' + normalized);
    }

    function parseDefinitions(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var articles = doc.querySelectorAll('article');
        var results = [];

        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            var header = article.querySelector('header');
            var title = '';
            if (header) {
                title = header.textContent.trim();
            }

            var defs = [];
            // RAE uses p.j, p.j1, p.j2 for definitions
            var defElements = article.querySelectorAll('p.j, p.j1, p.j2');
            for (var j = 0; j < defElements.length; j++) {
                var el = defElements[j];
                var text = el.textContent.trim();
                if (text) {
                    defs.push(text);
                }
            }

            // Fallback: try paragraphs with numbered definitions
            if (defs.length === 0) {
                var allP = article.querySelectorAll('p[class]');
                for (var k = 0; k < allP.length; k++) {
                    var p = allP[k];
                    var cls = p.className || '';
                    // Skip etymology (n2), header elements, etc.
                    if (cls.match(/^[jm]/) || cls.indexOf('acep') >= 0) {
                        var t = p.textContent.trim();
                        if (t) defs.push(t);
                    }
                }
            }

            if (defs.length > 0) {
                results.push({ title: title, definitions: defs });
            }
        }

        return results;
    }

    return {
        fetch: function (word) {
            var url = buildUrl(word);
            return fetch(url)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    return response.text();
                })
                .then(function (html) {
                    var results = parseDefinitions(html);
                    if (results.length === 0) {
                        throw new Error('No se encontraron definiciones');
                    }
                    return results;
                });
        }
    };
})();
