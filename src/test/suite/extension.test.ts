import * as assert from 'assert'
import * as vscode from 'vscode'
import { intersection } from '../../extension'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Set intersection only includes items in both sets', () => {
    const setA = new Set([1, 2, 3, 4, 5])
    const setB = new Set([3, 4, 5, 6, 7])
    const setC = intersection(setA, setB)
    assert.strictEqual(setC.size, 3)
    assert.ok(setC.has(3))
    assert.ok(setC.has(4))
    assert.ok(setC.has(5))
  })
})
