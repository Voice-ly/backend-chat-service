import { userHandler, onlineUsers as exportedOnlineUsers } from '../../api/handlers/userHandler';

describe('userHandler', () => {
  let io: any;
  let socket: any;
  let handlers: Record<string, Function> = {} as any;

  beforeEach(() => {
    handlers = {};
    socket = {
      id: 'socket1',
      on: (ev: string, fn: Function) => (handlers[ev] = fn),
      join: jest.fn(),
    } as any;
    io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as any;
    // reset module-level onlineUsers by re-requiring the module
    jest.resetModules();
  });

  it('adds new user and emits usersOnline', () => {
    const mod = require('../../api/handlers/userHandler');
    const userHandlerFn = mod.userHandler;

    userHandlerFn(io, socket);

    handlers['newUser']({ userId: 'u1', name: 'Alice', roomId: 'room1' });

    expect(socket.join).toHaveBeenCalledWith('room1');
    expect(io.to).toHaveBeenCalledWith('room1');
    expect((io.to('room1') as any).emit).toHaveBeenCalledWith('usersOnline', expect.any(Array));
    expect(mod.onlineUsers).toEqual(expect.arrayContaining([expect.objectContaining({ userId: 'u1', name: 'Alice', roomId: 'room1' })]));
  });

  it('removes user on disconnect and emits updated list', () => {
    const mod = require('../../api/handlers/userHandler');
    const userHandlerFn = mod.userHandler;

    // add a user first
    mod.onlineUsers = [{ socketId: 'socket1', userId: 'u1', name: 'Alice', roomId: 'room1' }];

    userHandlerFn(io, socket);

    handlers['disconnect']();

    expect(mod.onlineUsers).toEqual([]);
    expect(io.to).toHaveBeenCalledWith('room1');
    expect((io.to('room1') as any).emit).toHaveBeenCalledWith('usersOnline', []);
  });
});
