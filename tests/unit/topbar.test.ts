import { describe, it, expect } from 'vitest';
import { TopBarProvider, useTopBar } from '../../src/contexts/TopBarContext';

describe('TopBarContext & Layout Slots (T-098 SRP)', () => {
  it('debe exportar TopBarProvider como un componente funcional valido', () => {
    expect(TopBarProvider).toBeDefined();
    expect(typeof TopBarProvider).toBe('function');
  });

  it('debe exportar el hook useTopBar como una funcion valida', () => {
    expect(useTopBar).toBeDefined();
    expect(typeof useTopBar).toBe('function');
  });
});
