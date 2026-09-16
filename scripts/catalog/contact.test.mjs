import test from 'node:test';
import assert from 'node:assert/strict';
import {ALTACO_PHONE,ALTACO_PHONE_TEL,altacoContactLine} from '../../src/catalog/contact.mjs';

test('the owner-approved phone is the single source for both PDF generators', () => {
  assert.equal(ALTACO_PHONE, '+38 097 242 21 21');
  assert.equal(ALTACO_PHONE_TEL, '+380972422121');
  assert.equal(altacoContactLine(), '+38 097 242 21 21 / ALTACO.COM.UA');
});
