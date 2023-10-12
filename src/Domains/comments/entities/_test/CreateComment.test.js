const CreateComment = require('../CreateComment');

describe('CreateComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'First comment!',
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 12345,
      owner: { id: 'user-123' },
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError(
      'CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CreateComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'First comment!',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const createComment = new CreateComment(payload);

    // Assert
    expect(createComment).toBeInstanceOf(CreateComment);
    expect(createComment.content).toEqual(payload.content);
    expect(createComment.owner).toEqual(payload.owner);
    expect(createComment.threadId).toEqual(payload.threadId);
  });
});
