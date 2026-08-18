import { gradeRepository } from '../repositories/grade.repository';
import { assertExists } from '../utils/helpers';

export const gradeService = {
  list() {
    return gradeRepository.findAll();
  },
  get(id: number) {
    return assertExists(gradeRepository.findById(id), 'Grade not found');
  },
  create(data: { name: string; level: number }) {
    return gradeRepository.create(data);
  },
  update(id: number, data: Partial<{ name: string; level: number }>) {
    return assertExists(gradeRepository.update(id, data), 'Grade not found');
  },
  remove(id: number) {
    return assertExists(gradeRepository.delete(id), 'Grade not found');
  },
};
