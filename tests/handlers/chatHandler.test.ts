jest.mock('../../api/services/chatService');
const chatService = require('../../api/services/chatService');
const { chatHandler } = require('../../api/handlers/chatHandler');

describe('chatHandler', () => {
  let io: any;
  let socket: any;
  let handlers: Record<string, Function> = {} as any;

  beforeEach(() => {
    handlers = {};
    socket = { id: 'socket1', on: (ev: string, fn: Function) => (handlers[ev] = fn) } as any;
    io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as any;
    chatService.storeMessage = jest.fn().mockResolvedValue(undefined);
  });

  it('emits message and calls storeMessage', () => {
    chatHandler(io, socket);

    const payload = { userId: 'u1', message: ' Hello ', roomId: 'r1' };

    handlers['chat:message'](payload);

    expect(io.to).toHaveBeenCalledWith('r1');
    expect((io.to('r1') as any).emit).toHaveBeenCalled();
    expect(chatService.storeMessage).toHaveBeenCalled();
  });

  it('does nothing for empty message or missing room', () => {
    chatHandler(io, socket);

    handlers['chat:message']({ userId: 'u1', message: '   ', roomId: 'r1' });
    handlers['chat:message']({ userId: 'u1', message: 'hello', roomId: '' });

    expect(io.to).not.toHaveBeenCalled();
    expect(chatService.storeMessage).not.toHaveBeenCalled();
  });
});
