import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSalary } from '../src/utils/salary.js';

test('yearly rupee range', () => {
  assert.deepEqual(parseSalary('₹6,00,000 - ₹9,00,000 a year'), { minLpa: 6, maxLpa: 9 });
});

test('lacs per annum', () => {
  assert.deepEqual(parseSalary('6-10 Lacs PA'), { minLpa: 6, maxLpa: 10 });
});

test('monthly range converts to LPA', () => {
  assert.deepEqual(parseSalary('₹25,000 - ₹40,000 a month'), { minLpa: 3, maxLpa: 4.8 });
});

test('single value', () => {
  assert.deepEqual(parseSalary('8 LPA'), { minLpa: 8, maxLpa: 8 });
});

test('not disclosed returns null', () => {
  assert.equal(parseSalary('Not disclosed'), null);
  assert.equal(parseSalary(''), null);
});
