import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  FAULTY_PANEL,
  INITIAL_STATE,
  NORMAL_WATTS,
  SHADED_WATTS,
  STRING_PEER_WATTS,
  recommend,
  simulate,
  type SimState,
} from './inverter-sim.ts'

const string: SimState = { ...INITIAL_STATE, mode: 'string' }
const micro: SimState = { ...INITIAL_STATE, mode: 'micro' }
const watts = (state: SimState) => simulate(state).panels.map((panel) => panel.watts)

describe('simulate', () => {
  it('sem eventos, todas as placas geram normal nos dois modos', () => {
    for (const state of [string, micro]) {
      const result = simulate(state)
      assert.ok(result.panels.every((panel) => panel.status === 'normal'))
      assert.equal(result.total, NORMAL_WATTS * 8)
      assert.deepEqual(result.dcCables, ['energia', 'energia'])
    }
  })

  it('sombra no string derruba a série inteira; no micro, só a placa', () => {
    assert.deepEqual(watts({ ...string, shaded: [2] }), [
      STRING_PEER_WATTS, STRING_PEER_WATTS, SHADED_WATTS, STRING_PEER_WATTS,
      NORMAL_WATTS, NORMAL_WATTS, NORMAL_WATTS, NORMAL_WATTS,
    ])
    const microWatts = watts({ ...micro, shaded: [2] })
    assert.equal(microWatts[2], SHADED_WATTS)
    assert.equal(microWatts.filter((w) => w === NORMAL_WATTS).length, 7)
  })

  it('falha numa placa: série inteira no string, só ela no micro', () => {
    assert.deepEqual(watts({ ...string, panelFault: true }).slice(0, 4), [0, 0, 0, 0])
    const microWatts = watts({ ...micro, panelFault: true })
    assert.equal(microWatts[FAULTY_PANEL], 0)
    assert.equal(microWatts.filter((w) => w === 0).length, 1)
  })

  it('falha no equipamento: tudo para no string, só 4 placas no micro', () => {
    assert.equal(simulate({ ...string, equipmentFault: true }).total, 0)
    const result = simulate({ ...micro, equipmentFault: true })
    assert.equal(result.panels.filter((panel) => panel.watts === 0).length, 4)
    assert.equal(result.total, NORMAL_WATTS * 4)
    assert.deepEqual(result.equipmentDown, [true, false])
  })

  it('emergência: micro apaga os cabos; string só apaga com desligamento rápido', () => {
    assert.deepEqual(simulate({ ...micro, emergency: true }).dcCables, ['desligado', 'desligado'])
    assert.deepEqual(simulate({ ...string, emergency: true }).dcCables, ['perigo', 'perigo'])
    assert.deepEqual(
      simulate({ ...string, emergency: true, rapidShutdown: true }).dcCables,
      ['desligado', 'desligado']
    )
    assert.equal(simulate({ ...string, emergency: true }).total, 0)
  })
})

describe('recommend', () => {
  it('sombra e telhado sem ser grande e limpo: micro', () => {
    assert.equal(recommend({ shadeOrOrientations: true, largeNoObstacles: false }), 'micro')
  })
  it('sem sombra, grande e sem obstáculos: string', () => {
    assert.equal(recommend({ shadeOrOrientations: false, largeNoObstacles: true }), 'string')
  })
  it('respostas que se contradizem ou não decidem: depende', () => {
    assert.equal(recommend({ shadeOrOrientations: true, largeNoObstacles: true }), 'depende')
    assert.equal(recommend({ shadeOrOrientations: false, largeNoObstacles: false }), 'depende')
  })
})
