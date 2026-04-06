#!/usr/bin/env python3
"""
Scrabble Dictionary Build Pipeline

Filters a raw Spanish word list into a Scrabble-legal dictionary.
Applies official rules: 2-15 characters, Spanish alphabet only,
no hyphens, no abbreviations.

Usage:
    python3 scripts/build-dictionary.py [--input data/words-raw.txt] [--output data/words.txt]

The script logs filter stats so you can audit what was removed and why.
"""

import argparse
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

# Valid Spanish Scrabble characters (lowercase only)
# a-z plus: á, é, í, ó, ú, ü, ñ
VALID_CHARS_PATTERN = re.compile(r'^[a-záéíóúüñ]+$')

MIN_LENGTH = 2
MAX_LENGTH = 15

# Expected output range for sanity check
MIN_EXPECTED = 80_000
MAX_EXPECTED = 700_000  # upper bound; RAE-sourced lists can be 650K+ with all conjugations


def normalize_word(word: str) -> str:
    """NFC normalize, lowercase, strip whitespace."""
    return unicodedata.normalize('NFC', word.strip().lower())


def classify_rejection(word: str) -> str:
    """Return the reason a word is rejected, or None if valid."""
    if len(word) < MIN_LENGTH:
        return 'too_short'
    if len(word) > MAX_LENGTH:
        return 'too_long'
    if '-' in word:
        return 'has_hyphen'
    if '.' in word:
        return 'has_period'
    if ' ' in word:
        return 'has_space'
    if not VALID_CHARS_PATTERN.match(word):
        return 'invalid_chars'
    return None


def build_dictionary(input_path: Path, output_path: Path) -> dict:
    """Read input, filter, deduplicate, sort, write output. Return stats."""
    stats = {
        'input_total': 0,
        'output_total': 0,
        'duplicates_removed': 0,
        'rejections': Counter(),
    }

    # Read and normalize all words
    raw_words = []
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in f:
            word = normalize_word(line)
            if word:  # skip empty lines
                raw_words.append(word)

    stats['input_total'] = len(raw_words)

    # Filter and deduplicate
    seen = set()
    accepted = []

    for word in raw_words:
        reason = classify_rejection(word)
        if reason:
            stats['rejections'][reason] += 1
            continue
        if word in seen:
            stats['duplicates_removed'] += 1
            continue
        seen.add(word)
        accepted.append(word)

    # Sort alphabetically
    accepted.sort()
    stats['output_total'] = len(accepted)

    # Write output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        for word in accepted:
            f.write(word + '\n')

    return stats


def print_stats(stats: dict):
    """Print filter statistics."""
    print('\n=== Scrabble Dictionary Build Stats ===')
    print(f'Input words:     {stats["input_total"]:>10,}')
    print(f'Output words:    {stats["output_total"]:>10,}')
    print(f'Duplicates:      {stats["duplicates_removed"]:>10,}')
    print(f'Total rejected:  {sum(stats["rejections"].values()):>10,}')
    print()
    print('Rejection breakdown:')
    for reason, count in stats['rejections'].most_common():
        print(f'  {reason:<20} {count:>10,}')
    print()

    # Sanity check
    if stats['output_total'] < MIN_EXPECTED:
        print(f'WARNING: Output ({stats["output_total"]:,}) is below expected minimum ({MIN_EXPECTED:,}).')
        print('         The word list may be incomplete. Manual review recommended.')
    elif stats['output_total'] > MAX_EXPECTED:
        print(f'WARNING: Output ({stats["output_total"]:,}) is above expected maximum ({MAX_EXPECTED:,}).')
        print('         The word list may contain non-Scrabble words. Manual review recommended.')
    else:
        print(f'Output count {stats["output_total"]:,} is within expected range ({MIN_EXPECTED:,}-{MAX_EXPECTED:,}).')

    print('=== Build complete ===\n')


def main():
    parser = argparse.ArgumentParser(description='Build Scrabble dictionary from raw word list')
    parser.add_argument('--input', type=Path, default=Path('data/words-raw.txt'),
                        help='Input word list (default: data/words-raw.txt)')
    parser.add_argument('--output', type=Path, default=Path('data/words.txt'),
                        help='Output filtered dictionary (default: data/words.txt)')
    args = parser.parse_args()

    if not args.input.exists():
        print(f'Error: Input file not found: {args.input}', file=sys.stderr)
        sys.exit(1)

    print(f'Building dictionary from {args.input} ...')
    stats = build_dictionary(args.input, args.output)
    print_stats(stats)

    # Exit with error if outside expected range (for CI/automation)
    if stats['output_total'] < MIN_EXPECTED or stats['output_total'] > MAX_EXPECTED:
        sys.exit(1)


if __name__ == '__main__':
    main()
