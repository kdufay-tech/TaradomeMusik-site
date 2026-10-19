// Unit tests for the community chat's image guard (TEOS M4 fix round 1). Node >= 22.18 / 24 runs the
// .ts module directly (type stripping). Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { safeCommunityImageUrl } from "../lib/chatUrl.ts";

const O = "https://wfxpxwlynsphutjhhdje.supabase.co";
const CH = "2021495d-4b53-4d43-93c9-f6dd015e5502";
const OBJ = "0cd26e42-a33a-431d-846d-7eecf4fc5ddf-fan_pic.jpg";
const PUB = O + "/storage/v1/object/public/chat-media/" + CH + "/" + OBJ;
const ok = (u) => safeCommunityImageUrl(u, O);

test("shows this project's public chat-media images", () => {
  assert.equal(ok(PUB), PUB);
  assert.equal(safeCommunityImageUrl(PUB, O + "/"), PUB, "origin given with a trailing slash");
});

test("refuses other schemes, hosts, ports, credentials and look-alikes", () => {
  for (const u of [
    "javascript:alert(1)", "data:image/png;base64,AAAA", PUB.replace("https:", "http:"),
    "https://evil.example/storage/v1/object/public/chat-media/" + CH + "/" + OBJ,
    "https://wfxpxwlynsphutjhhdje.supabase.co.evil.example/storage/v1/object/public/chat-media/" + CH + "/" + OBJ,
    "https://evilxwlynsphutjhhdje.supabase.co/storage/v1/object/public/chat-media/" + CH + "/" + OBJ,
    PUB.replace(".co/", ".co:8443/"), PUB.replace("https://", "https://u:p@"), "//wfxpxwlynsphutjhhdje.supabase.co/x",
    "", null, undefined, 1, {},
  ]) assert.equal(ok(u), null, String(u));
});

test("refuses other buckets, private files, other paths, queries and fragments", () => {
  for (const u of [
    O + "/storage/v1/object/public/artist-public/" + CH + "/" + OBJ,
    O + "/storage/v1/object/sign/chat-files/" + CH + "/" + OBJ + "?token=abcdefghijkl",  // fans never get private files
    O + "/storage/v1/object/public/chat-media/" + CH + "/../" + CH + "/" + OBJ,
    O + "/storage/v1/object/public/chat-media/" + CH + "%2F..%2F" + OBJ,
    O + "/storage/v1/object/public/chat-media/" + CH + "/x.png",
    O + "/rest/v1/chat_messages", PUB + "?x=1", PUB + "#x",
  ]) assert.equal(ok(u), null, u);
});

test("a bad configured origin fails closed", () => {
  assert.equal(safeCommunityImageUrl(PUB, "not a url"), null);
  assert.equal(safeCommunityImageUrl(PUB, "https://other.supabase.co"), null);
});
