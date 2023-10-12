const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      // Arrange

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const createThread = new CreateThread({
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const createdThread = await threadRepositoryPostgres.createThread(
        createThread,
      );

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(
        createdThread.id,
      );
      expect(threads).toHaveLength(1);
      expect(createdThread).toStrictEqual(
        new CreatedThread({
          id: 'thread-123',
          title: createThread.title,
          owner: createThread.owner,
        }),
      );
    });
  });

  describe('verifyThreadIsExist function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        threadRepositoryPostgres.verifyThreadIsExist('thread-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread found by id', async () => {
      // Arrange

      await UsersTableTestHelper.addUser({ id: 'user-123' });

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      return expect(
        threadRepositoryPostgres.getThreadById(threadId),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        threadRepositoryPostgres.getThreadById('hello-world'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should get thread by thread ID correctly', async () => {
      // Arrange
      const threadData = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-123',
      };

      const userData = {
        id: 'user-123',
        username: 'the-username',
      };

      await UsersTableTestHelper.addUser(userData);
      await ThreadsTableTestHelper.addThread(threadData);

      // stub!
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(
        threadData.id,
      );

      // Assert
      expect(thread).toBeDefined();
      expect(thread).toHaveProperty('date');
      expect(thread.id).toEqual(threadData.id);
      expect(thread.title).toEqual(threadData.title);
      expect(thread.body).toEqual(threadData.body);
      expect(thread.username).toEqual(userData.username);
    });
  });
});
