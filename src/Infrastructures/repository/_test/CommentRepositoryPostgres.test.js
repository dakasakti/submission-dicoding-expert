const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment and return created comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const createComment = new CreateComment({
        content: 'Comment content',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const createdComment = await commentRepositoryPostgres.createComment(
        createComment,
      );

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        createdComment.id,
      );
      expect(comments).toHaveLength(1);
      expect(createdComment).toStrictEqual(
        new CreatedComment({
          id: 'comment-123',
          content: createComment.content,
          owner: createComment.owner,
        }),
      );
    });
  });

  describe('verifyCommentIsExist function', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.verifyCommentIsExist('hello-world'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      // Arrange
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.verifyCommentIsExist(commentId),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should verify the comment owner correctly', async () => {
      // Arrange
      const commentId = 'comment-124';
      const userId = 'user-124';
      const threadId = 'thread-124';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId),
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw UnauthorizedError when provided userId is not the comment owner', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';
      const wrongUserId = 'user-456';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, wrongUserId),
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.deleteCommentById('hello-world'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should delete comment by id and return success correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        commentId,
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should get comments by thread ID correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        date: '2022-12-29T07:44:10.275Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId,
        date: '2022-12-29T07:44:03.301Z',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId,
      );

      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-456');
      expect(comments[0].date).toEqual(new Date('2022-12-29T00:44:03.301Z'));
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('Lorem ipsum...');
      expect(comments[0].is_delete).toEqual(false);
      expect(comments[1].id).toEqual('comment-123');
      expect(comments[1].date).toEqual(new Date('2022-12-29T00:44:10.275Z'));
      expect(comments[1].username).toEqual('dicoding');
      expect(comments[1].content).toEqual('Lorem ipsum...');
      expect(comments[1].is_delete).toEqual(false);
    });

    it('should show empty array if no comment found by thread ID', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId,
      );

      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(0);
    });
  });
});
