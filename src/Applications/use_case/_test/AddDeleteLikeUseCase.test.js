const AddDeleteLikeUseCase = require('../AddDeleteLikeUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('AddDeleteLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add like action correctly if like DOES NOT exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false)); // like does not exist
    mockLikeRepository.createLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteLikeUseCase = new AddDeleteLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addDeleteLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyLikeIsExist).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.createLike).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
  });

  it('should orchestrating the delete like action correctly if like DOES already exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true)); // like already exist
    mockLikeRepository.deleteLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addDeleteLikeUseCase = new AddDeleteLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addDeleteLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyLikeIsExist).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.deleteLike).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
  });
});
