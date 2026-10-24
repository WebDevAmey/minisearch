
# MiniSearch 🔎

A tiny full-text search engine built from scratch in Node.js.

Inspired by PlanetScale's technical blog:
[Anatomy of a Postgres Search Engine](https://planetscale.com/blog/anatomy-of-a-postgres-search-engine)

## Features

- Text tokenisation and normalisation
- Inverted index
- AND and OR search queries
- TF-IDF-style relevance scoring
- Add, update and delete documents
- Basic index statistics
- Zero external dependencies

## Getting Started

Requires Node.js 18 or later.

```bash
git clone <your-repository-url>
cd minisearch
node index.js
```

Run a custom query:

```bash
node index.js "memory data" AND
node index.js "redis database" OR
node index.js "inverted index" AND
```

Run tests:

```bash
npm test
```

## How It Works

### 1. Tokenisation

Converts text into lowercase searchable terms.

Example:

`Redis stores data in memory`

becomes:

`["redis", "stores", "data", "in", "memory"]`

### 2. Inverted Index

Maps terms to the documents containing them.

```text
memory   -> [document 1, document 3]
database -> [document 2, document 5]
```

### 3. Query Processing

- AND returns documents containing every query term.
- OR returns documents containing at least one query term.

### 4. Ranking

Uses a simple TF-IDF-style formula to give more weight to rarer terms and account for repeated occurrences.

This is a learning-oriented scoring formula, not full BM25.

### 5. Document Updates

Updates remove the old postings and index the new document.
Deletions remove the document from the index.

## Current Limitations

- In-memory storage; data is lost when the process exits.
- No HTTP API or persistent storage.
- Positions are stored, but phrase search is not implemented.
- No typo tolerance, stemming or full BM25.
- Intended for learning, not production use.

## Future Improvements

- Phrase search
- BM25 ranking
- Persistent index storage
- REST API
- Search performance benchmarks

## Inspiration

PlanetScale — Anatomy of a Postgres Search Engine:
https://planetscale.com/blog/anatomy-of-a-postgres-search-engine

## License

MIT
