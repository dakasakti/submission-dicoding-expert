const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createReply function', () => {
    it('should persist create reply and return created reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const createReply = new CreateReply({
        content: 'Reply content',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const createdReply = await replyRepositoryPostgres.createReply(
        createReply,
      );

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(
        createdReply.id,
      );
      expect(replies).toHaveLength(1);
      expect(createdReply).toStrictEqual(
        new CreatedReply({
          id: 'reply-123',
          content: createReply.content,
          owner: createReply.owner,
        }),
      );
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies by thread id correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const replyData = {
        id: 'reply-123',
        content: 'Reply content',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2023-10-12T12:00:00.000Z',
      };
      const userData = {
        id: 'user-123',
        username: 'the-username',
      };
      await UsersTableTestHelper.addUser(userData);
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply(replyData);
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const repliesByThreadId =
        await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(repliesByThreadId).toBeDefined();
      expect(repliesByThreadId).toHaveLength(1);
      expect(repliesByThreadId[0]).toHaveProperty('id');
      expect(repliesByThreadId[0].id).toEqual(replyData.id);
      expect(repliesByThreadId[0]).toHaveProperty('content');
      expect(repliesByThreadId[0].content).toEqual(replyData.content);
      expect(repliesByThreadId[0]).toHaveProperty('date');
      expect(repliesByThreadId[0]).toHaveProperty('username');
      expect(repliesByThreadId[0].username).toEqual(userData.username);
      expect(repliesByThreadId[0]).toHaveProperty('comment_id');
      expect(repliesByThreadId[0].comment_id).toEqual(replyData.commentId);
      expect(repliesByThreadId[0]).toHaveProperty('is_delete');
      expect(repliesByThreadId[0].is_delete).toEqual(false);
    });
  });

  describe('verifyReplyIsExist function', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        replyRepositoryPostgres.verifyReplyIsExist('hello-world'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply found', async () => {
      // Arrange
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: replyId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        replyRepositoryPostgres.verifyReplyIsExist(replyId),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should verify the reply owner correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: commentId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, userId),
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw UnauthorizedError when provided userId is not the reply owner', async () => {
      // Arrange
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userId = 'user-123';
      const wrongUserId = 'user-456';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: commentId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, wrongUserId),
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        replyRepositoryPostgres.deleteReplyById('hello-world'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should delete reply by id and return success correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: commentId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: 'user-123',
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual(true);
    });
  });
});
