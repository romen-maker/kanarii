import { describe, it, expect } from 'vitest';
import { TopBarProvider, useTopBar } from '../../src/contexts/TopBarContext';
import { useTopBarActions } from '../../src/hooks/useTopBarActions';

describe('TopBarContext & Layout Slots (T-098/T-099 SRP & Multi-view Actions)', () => {
  it('debe exportar TopBarProvider como un componente funcional valido', () => {
    expect(TopBarProvider).toBeDefined();
    expect(typeof TopBarProvider).toBe('function');
  });

  it('debe exportar el hook useTopBar como una funcion valida', () => {
    expect(useTopBar).toBeDefined();
    expect(typeof useTopBar).toBe('function');
  });

  it('debe exportar el hook useTopBarActions como una funcion valida', () => {
    expect(useTopBarActions).toBeDefined();
    expect(typeof useTopBarActions).toBe('function');
  });
});
