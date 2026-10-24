
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MiniSearch,
  createDemoEngine
} = require("./index");

test("AND returns documents containing every term", () => {
  const engine = createDemoEngine();

  const results = engine.search("memory data", "AND");

  assert.deepEqual(
    results.map(doc => doc.id).sort(),
    [1, 3]
  );
});

test("OR returns documents containing either term", () => {
  const engine = createDemoEngine();

  const results = engine.search("redis database", "OR");
  const ids = results.map(doc => doc.id);

  assert.ok(ids.includes(1));
  assert.ok(ids.includes(2));
  assert.ok(ids.includes(5));
});

test("deleting a document removes it from search", () => {
  const engine = createDemoEngine();

  assert.equal(engine.removeDocument(1), true);
  assert.equal(engine.search("internals").length, 0);
});

test("updating a document replaces its old content", () => {
  const engine = new MiniSearch();

  engine.addDocument({
    id: 1,
    title: "Old title",
    body: "oldword"
  });

  engine.addDocument({
    id: 1,
    title: "New title",
    body: "newword"
  });

  assert.equal(engine.search("oldword").length, 0);
  assert.equal(engine.search("newword").length, 1);
  assert.equal(engine.stats().documents, 1);
});

test("empty queries return no results", () => {
  const engine = createDemoEngine();

  assert.deepEqual(engine.search(" !!! "), []);
});
