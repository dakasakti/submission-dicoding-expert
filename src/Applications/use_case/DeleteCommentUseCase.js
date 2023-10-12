class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadIsExist(useCasePayload.threadId);
    await this._commentRepository.verifyCommentIsExist(useCasePayload.commentId);
    await this._commentRepository.verifyCommentOwner(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    await this._commentRepository.deleteCommentById(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
