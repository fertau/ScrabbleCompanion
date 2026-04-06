var RAE = (function () {
    var PROXY_URL = 'https://api.allorigins.win/raw?url=';
    var DB_NAME = 'scrabble-rae-cache';
    var DB_VERSION = 1;
    var STORE_NAME = 'definitions';
    var _db = null;

    // --- IndexedDB Cache Layer ---

    function openDB() {
        if (_db) return Promise.resolve(_db);
        return new Promise(function (resolve, reject) {
            var request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'word' });
                }
            };
            request.onsuccess = function (e) {
                _db = e.target.result;
                resolve(_db);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    function getCached(word) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var request = store.get(word);
                request.onsuccess = function () { resolve(request.result || null); };
                request.onerror = function () { reject(request.error); };
            });
        }).catch(function () { return null; });
    }

    function setCached(word, verified, entries) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.put({
                    word: word,
                    verified: verified,
                    entries: entries,
                    timestamp: Date.now()
                });
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        }).catch(function () { /* ignore cache write failures */ });
    }

    // --- RAE Fetch with Retry ---

    var RETRY_DELAYS = [1000, 2000];
    var FETCH_TIMEOUT = 5000; // 5 seconds per attempt

    function buildUrl(word) {
        var normalized = word.normalize('NFC').trim().toLowerCase();
        return PROXY_URL + encodeURIComponent('https://dle.rae.es/' + normalized);
    }

    function fetchWithTimeout(url, timeout) {
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject(new Error('Tiempo de espera agotado'));
            }, timeout);
            fetch(url).then(function (response) {
                clearTimeout(timer);
                resolve(response);
            }).catch(function (err) {
                clearTimeout(timer);
                reject(err);
            });
        });
    }

    function fetchWithRetry(url, attempt) {
        attempt = attempt || 0;
        return fetchWithTimeout(url, FETCH_TIMEOUT).then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.text();
        }).catch(function (err) {
            if (attempt < RETRY_DELAYS.length) {
                return new Promise(function (resolve) {
                    setTimeout(resolve, RETRY_DELAYS[attempt]);
                }).then(function () {
                    return fetchWithRetry(url, attempt + 1);
                });
            }
            throw err;
        });
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
            var defElements = article.querySelectorAll('p.j, p.j1, p.j2');
            for (var j = 0; j < defElements.length; j++) {
                var el = defElements[j];
                var text = el.textContent.trim();
                if (text) {
                    defs.push(text);
                }
            }

            if (defs.length === 0) {
                var allP = article.querySelectorAll('p[class]');
                for (var k = 0; k < allP.length; k++) {
                    var p = allP[k];
                    var cls = p.className || '';
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
        /**
         * Fetch definitions for a word. Checks IndexedDB cache first.
         * Returns a promise that resolves to { entries: [...], cached: bool, verified: bool }
         */
        fetch: function (word) {
            var normalized = word.normalize('NFC').trim().toLowerCase();

            return getCached(normalized).then(function (cached) {
                if (cached && cached.entries && cached.entries.length > 0) {
                    return { entries: cached.entries, cached: true, verified: cached.verified };
                }

                var url = buildUrl(normalized);
                return fetchWithRetry(url).then(function (html) {
                    var results = parseDefinitions(html);
                    var verified = results.length > 0;
                    if (verified) {
                        setCached(normalized, true, results);
                    }
                    if (results.length === 0) {
                        throw new Error('No se encontraron definiciones');
                    }
                    return { entries: results, cached: false, verified: true };
                }).catch(function (err) {
                    // Don't cache failures — absence of record means "not yet checked"
                    throw err;
                });
            });
        },

        /**
         * Check if a word has been verified against RAE (from cache).
         * Returns promise resolving to: true, false, or null (not checked yet).
         */
        isVerified: function (word) {
            var normalized = word.normalize('NFC').trim().toLowerCase();
            return getCached(normalized).then(function (cached) {
                if (!cached) return null;
                return cached.verified;
            });
        }
    };
})();
