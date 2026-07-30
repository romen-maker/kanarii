import { describe, it, expect } from 'vitest';
import { navigationConfig } from '../../src/config/navigation';

describe('Navigation configuration (T-097 SRP & DRY)', () => {
  it('debe contener exclusivamente las herramientas comunitarias en la navegación principal', () => {
    const labels = navigationConfig.map(item => item.label);
    
    // Verificar que Mi Ficha se retiró de la navegación de comunidad
    expect(labels).not.toContain('Mi Ficha');

    // Verificar las herramientas de comunidad presentes
    expect(labels).toContain('Inicio');
    expect(labels).toContain('Tareas');
    expect(labels).toContain('Calendario');
    expect(labels).toContain('Tablón');
    expect(labels).toContain('Proyectos');
    expect(labels).toContain('Actas');
    expect(labels).toContain('Gobernanza');
    expect(labels).toContain('Marketplace');
  });

  it('no debe incluir enlaces con href = /ficha en la navegación principal', () => {
    const hrefs = navigationConfig.map(item => item.href);
    expect(hrefs).not.toContain('/ficha');
    expect(hrefs).not.toContain('/perfil');
  });
});
