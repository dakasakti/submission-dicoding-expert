const autoBind = require('auto-bind');
const AddDeleteLikeUseCase = require('../../../../Applications/use_case/AddDeleteLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addDeleteLikeUseCase = this._container.getInstance(
      AddDeleteLikeUseCase.name,
    );

    await addDeleteLikeUseCase.execute({
      owner: userId,
      threadId,
      commentId,
    });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
