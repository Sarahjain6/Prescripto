import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../middlewares/rateLimit.js";

const makeRes = () => {
  const res = { statusCode: 200, headers: {}, body: null };
  res.set = (k, v) => { res.headers[k] = v; return res; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};

test("allows up to max requests then answers 429 with Retry-After", () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 3 });
  let passed = 0;
  for (let i = 0; i < 3; i++) limiter({ ip: "1.1.1.1" }, makeRes(), () => passed++);
  assert.equal(passed, 3);

  const res = makeRes();
  let nextCalled = false;
  limiter({ ip: "1.1.1.1" }, res, () => (nextCalled = true));
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.success, false);
  assert.ok(Number(res.headers["Retry-After"]) > 0);
});

test("limits each IP separately", () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 1 });
  let passed = 0;
  limiter({ ip: "1.1.1.1" }, makeRes(), () => passed++);
  limiter({ ip: "2.2.2.2" }, makeRes(), () => passed++);
  assert.equal(passed, 2);
});
