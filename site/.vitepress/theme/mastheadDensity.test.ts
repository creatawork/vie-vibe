import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mastheadDensity } from './mastheadDensity.ts'

test('home is full', () => {
  assert.equal(mastheadDensity('/', false), 'full')
  assert.equal(mastheadDensity('', false), 'full')
})

test('stats-view is minimal', () => {
  assert.equal(mastheadDensity('/stats-view', false), 'minimal')
  assert.equal(mastheadDensity('/stats-view/', false), 'minimal')
})

test('list routes are mid', () => {
  assert.equal(mastheadDensity('/articles/', false), 'mid')
  assert.equal(mastheadDensity('/series/', false), 'mid')
  assert.equal(mastheadDensity('/series/个人网站开发实录', false), 'mid')
  assert.equal(mastheadDensity('/projects', false), 'mid')
})

test('dated pages are narrow', () => {
  assert.equal(mastheadDensity('/articles/meta/how-this-site-works', true), 'narrow')
})

test('article path without date still narrow', () => {
  assert.equal(mastheadDensity('/articles/meta/how-this-site-works', false), 'narrow')
})