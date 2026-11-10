import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeHtml,
  cleanPoetryText,
  generateCaptchaChallenge,
  verifyCaptchaSolution,
} from '../server/security';
import { generateAdminToken, verifyAdminToken } from '../server/auth';

test('sanitizeHtml: escapes malicious HTML, script tags and quotes', () => {
  const malicious = '<script>alert("xss")</script><img src="x" onerror="evil()"/>';
  const clean = sanitizeHtml(malicious);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('</script>'), false);
  assert.equal(clean.includes('&lt;script&gt;'), true);
  assert.equal(clean.includes('&quot;xss&quot;'), true);
});

test('cleanPoetryText: preserves Tamil UTF-8 characters and normalizes newlines', () => {
  const tamilVerse = '  வசந்தம் மலர்கிறது\r\nதென்றல் வீசுகிறது  \0';
  const cleaned = cleanPoetryText(tamilVerse);
  assert.equal(cleaned.includes('வசந்தம் மலர்கிறது'), true);
  assert.equal(cleaned.includes('\r\n'), false);
  assert.equal(cleaned.includes('\n'), true);
  assert.equal(cleaned.includes('\0'), false);
  assert.equal(cleaned.startsWith(' '), false);
});

test('generateCaptchaChallenge & verifyCaptchaSolution: issues solvable challenges and burns one-time tokens', () => {
  const challenge = generateCaptchaChallenge();
  assert.ok(challenge.token);
  assert.ok(challenge.question);
  assert.ok(challenge.type);

  // Wrong answer must fail
  const wrongVerify = verifyCaptchaSolution(challenge.token, 'wrong_answer_xyz_999');
  assert.equal(wrongVerify, false);

  // In another challenge, solve correctly according to math
  // Test math generation directly
  const c2 = generateCaptchaChallenge();
  if (c2.type === 'math') {
    const match = c2.question.match(/(\d+)\s*\+\s*(\d+)/);
    if (match) {
      const sum = String(parseInt(match[1], 10) + parseInt(match[2], 10));
      const ok = verifyCaptchaSolution(c2.token, sum);
      assert.equal(ok, true);

      // Replay attack test: second verification with same token must fail
      const replay = verifyCaptchaSolution(c2.token, sum);
      assert.equal(replay, false);
    }
  }
});

test('JWT admin auth: issues and verifies tokens', () => {
  const payload = { id: 1, username: 'admin' };
  const token = generateAdminToken(payload);
  assert.ok(token);

  const verified = verifyAdminToken(token);
  assert.ok(verified);
  assert.equal(verified?.username, 'admin');
  assert.equal(verified?.id, 1);

  // Corrupt token must fail
  const invalid = verifyAdminToken(token + 'tampered');
  assert.equal(invalid, null);
});
