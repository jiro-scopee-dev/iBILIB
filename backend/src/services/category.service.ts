import { categoryRepository } from '../repositories/category.repository';
import { assertExists } from '../utils/helpers';

export const categoryService = {
  list() {
    return categoryRepository.findAll();
  },
  get(id: number) {
    return assertExists(categoryRepository.findById(id), 'Research category not found');
  },
  getBySlug(slug: string) {
    return assertExists(categoryRepository.findBySlug(slug), 'Research category not found');
  },
  create(data: { name: string; slug: string }) {
    return categoryRepository.create(data);
  },
  update(id: number, data: Partial<{ name: string; slug: string }>) {
    return assertExists(categoryRepository.update(id, data), 'Research category not found');
  },
  remove(id: number) {
    return assertExists(categoryRepository.delete(id), 'Research category not found');
  },
};
