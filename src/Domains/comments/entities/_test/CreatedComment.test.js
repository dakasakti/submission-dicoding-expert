const CreatedComment = require('../CreatedComment');

describe('a CreatedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'First comment',
    };

    // Action and Assert
    expect(() => new CreatedComment(payload)).toThrowError(
      'CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: ['hello world'],
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new CreatedComment(payload)).toThrowError(
      'CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create createdComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'First comment',
      owner: 'user-123',
    };

    // Action
    const createdComment = new CreatedComment(payload);

    // Assert
    expect(createdComment).toBeInstanceOf(CreatedComment);
    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.owner).toEqual(payload.owner);
  });
});
