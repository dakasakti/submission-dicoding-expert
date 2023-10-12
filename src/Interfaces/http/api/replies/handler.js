const autoBind = require('auto-bind');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postReplyHandler(request, h) {
    const { content } = request.payload;
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      content,
      owner: userId,
      threadId,
      commentId,
    });

    const response = h.response({
      status: 'success',
      data: { addedReply },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );
    await deleteReplyUseCase.execute({
      threadId,
      commentId,
      replyId,
      owner: userId,
    });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
