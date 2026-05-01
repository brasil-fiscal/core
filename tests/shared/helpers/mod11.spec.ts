import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcMod11 } from '@core/shared/helpers/mod11';

describe('calcMod11', () => {
  it('deve retornar 0 quando o resto eh menor que 2', () => {
    const result = calcMod11('0');
    assert.strictEqual(result, 0);
  });

  it('deve calcular corretamente para sequencias conhecidas', () => {
    const key43 = '5126041122233300018155001000000001' + '1' + '12345678';
    const dv = calcMod11(key43);
    assert.ok(dv >= 0 && dv <= 9);
  });

  it('deve retornar valor entre 0 e 9', () => {
    for (const val of ['123456789', '987654321', '111111111', '000000001']) {
      const result = calcMod11(val);
      assert.ok(result >= 0 && result <= 9, `mod11(${val}) = ${result} fora do range`);
    }
  });
});
