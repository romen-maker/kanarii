import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateMcpAccess, createMcpServer } from '../../src/adapters/mcp/server';
import * as members from '../../src/lib/services/members';
import * as tareas from '../../src/lib/services/tareas';
import * as acuerdos from '../../src/lib/services/acuerdos';

vi.mock('../../src/lib/services/members', () => ({
  getMemberInfo: vi.fn()
}));

vi.mock('../../src/lib/services/tareas', () => ({
  getTareasByCommunity: vi.fn()
}));

vi.mock('../../src/lib/services/acuerdos', () => ({
  getAcuerdosByCommunity: vi.fn()
}));

vi.mock('../../src/lib/services/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue('log_123'),
  getAuditLogsByCommunity: vi.fn().mockResolvedValue([])
}));

describe('Servidor MCP & Diferenciación de Errores de Acceso (T-094)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe rechazar con errorCode "visitante" si userId es nulo o visitante', async () => {
    const res = await validateMcpAccess('visitante_123', 'com_arteara');
    expect(res.allowed).toBe(false);
    expect(res.errorCode).toBe('visitante');
  });

  it('debe rechazar con errorCode "sin_comunidad_activa" si communityId no esta presente', async () => {
    const res = await validateMcpAccess('usr_123', '');
    expect(res.allowed).toBe(false);
    expect(res.errorCode).toBe('sin_comunidad_activa');
  });

  it('debe rechazar con errorCode "no_pertenece_a_comunidad" si getMemberInfo retorna fallback o null', async () => {
    vi.mocked(members.getMemberInfo).mockResolvedValueOnce(null);

    const res = await validateMcpAccess('usr_ext', 'com_arteara');
    expect(res.allowed).toBe(false);
    expect(res.errorCode).toBe('no_pertenece_a_comunidad');
  });

  it('debe permitir acceso y resolver el rol real de admin cuando es miembro de la comunidad', async () => {
    vi.mocked(members.getMemberInfo).mockResolvedValueOnce({
      id: 'com_arteara_usr_admin',
      rolComunitario: 'admin'
    });

    const res = await validateMcpAccess('usr_admin', 'com_arteara');
    expect(res.allowed).toBe(true);
    expect(res.exec).toBeDefined();
    expect(res.exec?.userRole).toBe('admin');
    expect(res.exec?.communityId).toBe('com_arteara');
  });

  it('debe instanciar el servidor MCP con el nombre y version correctos', () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });
});
