const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createLike(commentId, owner) {
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async verifyLikeIsExist(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) return true;
    return false;
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return Number(result.rows[0].count);
  }
}

module.exports = LikeRepositoryPostgres;
