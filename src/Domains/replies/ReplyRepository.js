/* eslint-disable no-unused-vars */
class ReplyRepository {
  async createReply(newReply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getRepliesByThreadId(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyIsExist(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReplyOwner(replyId, owner) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReplyById(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyRepository;
