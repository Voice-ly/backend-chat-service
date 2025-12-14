import { getHistoryByRoomId, storeMessage } from '../../api/services/chatService';

jest.mock('../../api/config/firebaseAdmin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

const { adminDb } = require('../../api/config/firebaseAdmin');

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeMessage', () => {
    it('should call add on the chat_history collection', async () => {
      const add = jest.fn().mockResolvedValue({});
      const collectionMock = jest.fn().mockReturnValue({ add });
      const docMock = jest.fn().mockReturnValue({ collection: collectionMock });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: docMock });

      await expect(storeMessage({ userId: 'u', name: 'n', message: 'hi', timestamp: 't', roomId: 'r' })).resolves.toBeUndefined();

      expect(adminDb.collection).toHaveBeenCalledWith('meetings');
      expect(docMock).toHaveBeenCalledWith('r');
      expect(collectionMock).toHaveBeenCalledWith('chat_history');
      expect(add).toHaveBeenCalled();
    });
  });

  describe('getHistoryByRoomId', () => {
    it('should map documents to chat history entries', async () => {
      const docs = [
        { id: '1', data: () => ({ name: 'Alice', message: 'Hello', timestamp: '2020-01-01' }) },
        { id: '2', data: () => ({ user: 'Bob', text: 'Hi', createdAt: '2020-02-01' }) },
      ];

      const get = jest.fn().mockResolvedValue({ docs });
      const collectionMock = jest.fn().mockReturnValue({ get });
      const docMock = jest.fn().mockReturnValue({ collection: collectionMock });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await getHistoryByRoomId('room1');

      expect(adminDb.collection).toHaveBeenCalledWith('meetings');
      expect(docMock).toHaveBeenCalledWith('room1');
      expect(collectionMock).toHaveBeenCalledWith('chat_history');
      expect(result).toEqual([
        { user: 'Alice', text: 'Hello', timestamp: '2020-01-01' },
        { user: 'Bob', text: 'Hi', timestamp: '2020-02-01' },
      ]);
    });
  });
});
