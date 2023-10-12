const CreateThread = require('../CreateThread');

describe('CreateThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
    };

    // Action & Assert
    expect(() => new CreateThread(payload)).toThrowError(
      'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: true,
      body: 12345,
      owner: { id: 'user-123' },
    };

    // Action & Assert
    expect(() => new CreateThread(payload)).toThrowError(
      'CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create CreateThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
      body: 'Thread body',
      owner: 'user-123',
    };

    // Action
    const createThread = new CreateThread(payload);

    // Assert
    expect(createThread).toBeInstanceOf(CreateThread);
    expect(createThread.title).toEqual(payload.title);
    expect(createThread.body).toEqual(payload.body);
    expect(createThread.owner).toEqual(payload.owner);
  });
});
