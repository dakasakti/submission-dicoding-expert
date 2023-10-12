const autoBind = require('auto-bind');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const ShowThreadUseCase = require('../../../../Applications/use_case/ShowThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      title,
      body,
      owner: id,
    });

    const response = h.response({
      status: 'success',
      data: { addedThread },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;
    const showThreadUseCase = this._container.getInstance(
      ShowThreadUseCase.name,
    );
    const shownThread = await showThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: { thread: shownThread },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
