
/**
 * MiniSearch
 * A tiny full-text search engine built from scratch.
 *
 * Features:
 * - Tokenisation
 * - Inverted index
 * - AND / OR queries
 * - TF-IDF-style relevance scoring
 * - Add, update and delete documents
 *
 * Run:
 *   node index.js
 *   node index.js "memory data" AND
 *   node index.js "redis database" OR
 */

class MiniSearch {
  constructor() {
    // Document ID -> complete document
    this.documents = new Map();

    // Word -> Map(document ID -> term frequency and positions)
    this.index = new Map();
  }

  tokenize(text) {
    return (
      String(text)
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? []
    );
  }

  addDocument(document) {
    if (document.id === undefined || document.id === null) {
      throw new Error("Document must have an id.");
    }

    if (
      typeof document.title !== "string" ||
      typeof document.body !== "string"
    ) {
      throw new Error("Document needs string title and body fields.");
    }

    // Updating an existing ID removes its old index entries first.
    if (this.documents.has(document.id)) {
      this.removeDocument(document.id);
    }

    const doc = { ...document };
    this.documents.set(doc.id, doc);

    const tokens = this.tokenize(
      `${doc.title} ${doc.body}`
    );

    tokens.forEach((term, position) => {
      if (!this.index.has(term)) {
        this.index.set(term, new Map());
      }

      const postings = this.index.get(term);

      if (!postings.has(doc.id)) {
        postings.set(doc.id, {
          tf: 0,
          positions: []
        });
      }

      const entry = postings.get(doc.id);

      entry.tf++;
      entry.positions.push(position);
    });
  }

  removeDocument(id) {
    const doc = this.documents.get(id);

    if (!doc) return false;

    const terms = new Set(
      this.tokenize(`${doc.title} ${doc.body}`)
    );

    for (const term of terms) {
      const postings = this.index.get(term);

      if (!postings) continue;

      postings.delete(id);

      // Remove terms that no longer appear in any document.
      if (postings.size === 0) {
        this.index.delete(term);
      }
    }

    this.documents.delete(id);
    return true;
  }

  search(query, mode = "AND", limit = 10) {
    const terms = [
      ...new Set(this.tokenize(query))
    ];

    if (terms.length === 0) return [];

    mode = mode.toUpperCase();

    if (!["AND", "OR"].includes(mode)) {
      throw new Error('Mode must be "AND" or "OR".');
    }

    // Get the postings list for each query term.
    const lists = terms.map(
      term => this.index.get(term) ?? new Map()
    );

    let ids;

    if (mode === "AND") {
      // Start with the smallest postings list.
      const smallest = [...lists].sort(
        (a, b) => a.size - b.size
      )[0];

      ids = [...smallest.keys()].filter(id =>
        lists.every(list => list.has(id))
      );
    } else {
      // OR: union of all matching document IDs.
      ids = [
        ...new Set(
          lists.flatMap(list => [...list.keys()])
        )
      ];
    }

    const totalDocuments = this.documents.size;

    const results = ids.map(id => {
      let score = 0;
      const matchedTerms = [];

      terms.forEach((term, i) => {
        const entry = lists[i].get(id);

        if (!entry) return;

        const documentFrequency = lists[i].size;

        const idf = Math.log(
          1 +
          (totalDocuments + 1) /
          (documentFrequency + 1)
        );

        const tfScore = 1 + Math.log(entry.tf);

        score += tfScore * idf;
        matchedTerms.push(term);
      });

      return {
        ...this.documents.get(id),
        score: Number(score.toFixed(3)),
        matchedTerms
      };
    });

    return results
      .sort(
        (a, b) =>
          b.score - a.score ||
          String(a.id).localeCompare(String(b.id))
      )
      .slice(0, Math.max(0, limit));
  }

  stats() {
    return {
      documents: this.documents.size,
      uniqueTerms: this.index.size,
      postings: [...this.index.values()].reduce(
        (sum, list) => sum + list.size,
        0
      )
    };
  }
}

// Sample dataset.
function createDemoEngine() {
  const engine = new MiniSearch();

  const documents = [
    {
      id: 1,
      title: "Redis Internals",
      body: "Redis stores data in memory using efficient data structures."
    },
    {
      id: 2,
      title: "PostgreSQL Indexing",
      body: "PostgreSQL uses indexes to speed up database queries."
    },
    {
      id: 3,
      title: "Building a Cache",
      body: "A cache stores frequently accessed data in memory."
    },
    {
      id: 4,
      title: "Search Engine Basics",
      body: "An inverted index maps words to documents and helps search engines find relevant results."
    },
    {
      id: 5,
      title: "Redis and PostgreSQL",
      body: "Redis can cache results from PostgreSQL to reduce repeated database queries."
    }
  ];

  documents.forEach(doc => engine.addDocument(doc));

  return engine;
}

function printResults(query, mode, results) {
  console.log(`\nQuery: "${query}" | Mode: ${mode}`);

  if (results.length === 0) {
    console.log("No matching documents found.");
    return;
  }

  results.forEach((result, i) => {
    console.log(
      `${i + 1}. ${result.title} (score: ${result.score})`
    );
    console.log(
      `   Matched: ${result.matchedTerms.join(", ")}`
    );
    console.log(`   ${result.body}`);
  });
}

// CLI entry point.
if (require.main === module) {
  const engine = createDemoEngine();
  const [query, mode = "AND"] = process.argv.slice(2);

  if (query) {
    printResults(
      query,
      mode.toUpperCase(),
      engine.search(query, mode)
    );
  } else {
    console.log("MiniSearch — Search Engine from Scratch");

    printResults(
      "memory data",
      "AND",
      engine.search("memory data", "AND")
    );

    printResults(
      "redis database",
      "OR",
      engine.search("redis database", "OR")
    );

    console.log("\nIndex statistics:");
    console.log(engine.stats());

    console.log(
      '\nTry: node index.js "inverted index" AND'
    );
  }
}

module.exports = {
  MiniSearch,
  createDemoEngine
};
