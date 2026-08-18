import { tagRepository } from '../repositories/tag.repository';
import { assertExists } from '../utils/helpers';

export const tagService = {
  list() {
    return tagRepository.findAll();
  },
  create(name: string) {
    return tagRepository.create(name);
  },
  update(id: number, name: string) {
    return assertExists(tagRepository.update(id, name), 'Tag not found');
  },
  remove(id: number) {
    return assertExists(tagRepository.delete(id), 'Tag not found');
  },
};
