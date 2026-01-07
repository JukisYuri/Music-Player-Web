# server/suggest/utils.py
import re
from unidecode import unidecode

def clean_text(text):
    text = unidecode(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

def generate_ngrams(text, n=3):
    text = clean_text(text)
    text = f' {text} '
    ngrams = set()
    for i in range(len(text) - n + 1):
        ngrams.add(text[i:i+n])
    return ngrams

def jaccard_similarity(query, target, n=3):
    query_ngrams = generate_ngrams(query, n)
    target_ngrams = generate_ngrams(target, n)
    if not query_ngrams or not target_ngrams:
        return 0.0
    intersection = len(query_ngrams.intersection(target_ngrams))
    union = len(query_ngrams.union(target_ngrams))
    return intersection / union