class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadIsExist(useCasePayload.threadId);
    await this._commentRepository.verifyCommentIsExist(useCasePayload.commentId);
    await this._replyRepository.verifyReplyIsExist(useCasePayload.replyId);
    await this._replyRepository.verifyReplyOwner(useCasePayload.replyId, useCasePayload.owner);
    await this._replyRepository.deleteReplyById(useCasePayload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
