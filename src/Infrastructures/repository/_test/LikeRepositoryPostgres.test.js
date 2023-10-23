const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createLike function', () => {
    it('should persist create like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const payload = {
        commentId: 'comment-123',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.createLike(payload.commentId, payload.owner);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentIdAndOwner(
        payload.commentId,
        payload.owner,
      );
      expect(likes).toHaveLength(1);
    });
  });

  describe('verifyLikeIsExist function', () => {
    it('should return TRUE if like already exist with the provided commentId and owner', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.verifyLikeIsExist(
        commentId,
        userId,
      );

      // Assert
      expect(isLikeExist).toBeDefined();
      expect(isLikeExist).toStrictEqual(true);
    });

    it('should return FALSE if like does not exist with the provided commentId and owner', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.verifyLikeIsExist(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(isLikeExist).toBeDefined();
      expect(isLikeExist).toStrictEqual(false);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like by commentId and owner correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.deleteLike(commentId, userId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentIdAndOwner(
        commentId,
        userId,
      );
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCount function', () => {
    it('should get like count by commentId correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCount(commentId);

      // Assert
      expect(likeCount).toBeDefined();
      expect(likeCount).toEqual(1);
    });
  });
});
