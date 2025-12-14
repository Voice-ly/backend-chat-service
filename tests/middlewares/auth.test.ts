import { authMiddleware } from '../../api/middlewares/auth';
import jwt from 'jsonwebtoken';

describe('authMiddleware', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('sets socket.user when token is valid', () => {
    const payload = { sub: '123' };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);

    const socket: any = { handshake: { auth: { token } } };
    const next = jest.fn();

    authMiddleware(socket, next);

    expect((socket as any).user).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with error for invalid token', () => {
    const socket: any = { handshake: { auth: { token: 'bad.token' } } };
    const next = jest.fn();

    authMiddleware(socket, next);

    expect(next).toHaveBeenCalled();
    const arg = (next as jest.Mock).mock.calls[0][0];
    expect(arg).toBeInstanceOf(Error);
  });
});
