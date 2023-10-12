const CreateComment = require('../../Domains/comments/entities/CreateComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadIsExist(useCasePayload.threadId);
    const createComment = new CreateComment(useCasePayload);
    return this._commentRepository.createComment(createComment);
  }
}

module.exports = AddCommentUseCase;
