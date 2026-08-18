import { subjectRepository } from '../repositories/subject.repository';
import { assertExists } from '../utils/helpers';

export const subjectService = {
  list(opts: { gradeId?: number } = {}) {
    return subjectRepository.findAll(opts);
  },
  get(id: number) {
    return assertExists(subjectRepository.findById(id), 'Subject not found');
  },
  create(data: { name: string; gradeId: number }) {
    return subjectRepository.create(data);
  },
  update(id: number, data: Partial<{ name: string; gradeId: number }>) {
    return assertExists(subjectRepository.update(id, data), 'Subject not found');
  },
  remove(id: number) {
    return assertExists(subjectRepository.delete(id), 'Subject not found');
  },
};
