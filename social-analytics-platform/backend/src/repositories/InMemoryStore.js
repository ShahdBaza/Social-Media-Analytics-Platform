// repositories/InMemoryStore.js
// DIP: Depend on abstraction (IRepository interface)
// OCP: Open for extension (new stores), closed for modification

class IRepository {
  findAll() { throw new Error('Not implemented'); }
  findById(id) { throw new Error('Not implemented'); }
  findBy(predicate) { throw new Error('Not implemented'); }
  save(entity) { throw new Error('Not implemented'); }
  update(id, data) { throw new Error('Not implemented'); }
  delete(id) { throw new Error('Not implemented'); }
}

class InMemoryStore extends IRepository {
  constructor() {
    super();
    this._store = new Map();
  }

  findAll() {
    return Array.from(this._store.values());
  }

  findById(id) {
    return this._store.get(id) || null;
  }

  findBy(predicate) {
    return this.findAll().filter(predicate);
  }

  save(entity) {
    this._store.set(entity.id, entity);
    return entity;
  }

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;
    const updated = Object.assign(existing, data, { updatedAt: new Date().toISOString() });
    this._store.set(id, updated);
    return updated;
  }

  delete(id) {
    const exists = this._store.has(id);
    this._store.delete(id);
    return exists;
  }

  count() {
    return this._store.size;
  }
}

module.exports = { IRepository, InMemoryStore };
