import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateTelegramBindToken, 
  verifyAndLinkTelegram, 
  getTelegramIdentityByUserId, 
  getTelegramIdentityByTelegramId, 
  revokeTelegramLink 
} from '../../src/lib/services/identities';
import * as core from '../../src/lib/services/_core';

vi.mock('../../src/lib/services/_core', () => ({
  db: { path: 'mock_db' },
  doc: vi.fn((_col, ...parts) => ({ path: parts.join('/'), id: parts[parts.length - 1] })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((...args) => ({ type: 'query', args })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
  Timestamp: {
    fromDate: vi.fn((d) => ({ toDate: () => d }))
  },
  colUserTelegramIdentities: { path: 'user_telegram_identities' },
  colCommunityMembers: { path: 'community_members' }
}));

describe('identities service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTelegramBindToken', () => {
    it('debe lanzar un error si no se proporciona userId', async () => {
      await expect(generateTelegramBindToken('')).rejects.toThrow('USER_ID_REQUIRED');
    });

    it('debe crear un nuevo registro de vinculación en estado pending si no existe previamente', async () => {
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: true,
        docs: []
      } as any);

      const token = await generateTelegramBindToken('usr_123');
      expect(token).toHaveLength(6);
      expect(core.setDoc).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar el registro existente si el usuario ya tenía uno en Firestore', async () => {
      const mockRef = { id: 'doc_1' };
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{ ref: mockRef }]
      } as any);

      const token = await generateTelegramBindToken('usr_123');
      expect(token).toHaveLength(6);
      expect(core.updateDoc).toHaveBeenCalledWith(mockRef, expect.objectContaining({
        status: 'pending',
        verificationToken: token
      }));
    });
  });

  describe('verifyAndLinkTelegram', () => {
    it('debe validar la presencia obligatoria de token y telegramUserId', async () => {
      await expect(verifyAndLinkTelegram('', 123456)).rejects.toThrow('TOKEN_REQUIRED');
      await expect(verifyAndLinkTelegram('ABCDEF', 0)).rejects.toThrow('TELEGRAM_USER_ID_REQUIRED');
    });

    it('debe lanzar TOKEN_INVALID si no encuentra el token pending', async () => {
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: true,
        docs: []
      } as any);

      await expect(verifyAndLinkTelegram('INVALID', 123456)).rejects.toThrow('TOKEN_INVALID');
    });

    it('debe lanzar TOKEN_EXPIRED si el token ya caducó', async () => {
      const pastDate = new Date(Date.now() - 10000);
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{
          ref: { id: 'doc_1' },
          data: () => ({
            userId: 'usr_123',
            status: 'pending',
            verificationToken: 'EXPIRED',
            verificationExpiresAt: { toDate: () => pastDate }
          })
        }]
      } as any);

      await expect(verifyAndLinkTelegram('EXPIRED', 123456)).rejects.toThrow('TOKEN_EXPIRED');
    });

    it('debe vincular la cuenta correctamente si el token es válido y no ha expirado', async () => {
      const futureDate = new Date(Date.now() + 10000);
      const mockRef = { id: 'doc_1' };
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{
          ref: mockRef,
          data: () => ({
            userId: 'usr_123',
            status: 'pending',
            verificationToken: 'VALID1',
            verificationExpiresAt: { toDate: () => futureDate }
          })
        }]
      } as any);

      const result = await verifyAndLinkTelegram('VALID1', 987654, 'romen_user');
      expect(result.status).toBe('linked');
      expect(result.telegramUserId).toBe(987654);
      expect(core.updateDoc).toHaveBeenCalledWith(mockRef, expect.objectContaining({
        status: 'linked',
        telegramUserId: 987654,
        telegramUsername: 'romen_user'
      }));
    });
  });

  describe('getTelegramIdentityByUserId & getTelegramIdentityByTelegramId', () => {
    it('debe retornar null defensivo si se pasan entradas nulas o inválidas', async () => {
      expect(await getTelegramIdentityByUserId('')).toBeNull();
      expect(await getTelegramIdentityByTelegramId(0)).toBeNull();
    });

    it('debe retornar la identidad mapeada cuando existe un documento vinculante en Firestore', async () => {
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: 'doc_user_1',
          data: () => ({ userId: 'usr_123', telegramUserId: 12345, status: 'linked' })
        }]
      } as any);

      const identity = await getTelegramIdentityByUserId('usr_123');
      expect(identity).not.toBeNull();
      expect(identity?.userId).toBe('usr_123');
      expect(identity?.telegramUserId).toBe(12345);
    });
  });

  describe('revokeTelegramLink', () => {
    it('debe lanzar error si no existe una identidad activa vinculada para revocar', async () => {
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: true,
        docs: []
      } as any);

      await expect(revokeTelegramLink('usr_123')).rejects.toThrow('IDENTITY_NOT_FOUND');
    });

    it('debe marcar la vinculación como revoked en Firestore si existía', async () => {
      const mockRef = { id: 'doc_1' };
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{ ref: mockRef }]
      } as any);

      await revokeTelegramLink('usr_123');
      expect(core.updateDoc).toHaveBeenCalledWith(mockRef, expect.objectContaining({
        status: 'revoked'
      }));
    });
  });

  describe('formatPrivateKey', () => {
    it('debe convertir \\n escapados y CRLF a saltos de línea reales \\n', async () => {
      const { formatPrivateKey } = await import('../../src/lib/firebaseAdmin');
      const raw = '"-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"';
      const formatted = formatPrivateKey(raw);
      expect(formatted).toContain('-----BEGIN PRIVATE KEY-----\n');
      expect(formatted).toContain('\n-----END PRIVATE KEY-----');
      expect(formatted).not.toContain('\\n');
      expect(formatted.startsWith('"')).toBe(false);
    });
  });
});
