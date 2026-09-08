const Department = require('../models/Department');
const Section = require('../models/Section');
const Subject = require('../models/Subject');

class AcademicService {
  async getDepartments() {
    return await Department.find({ isActive: true });
  }

  async getSections(departmentId, filters = {}) {
    const query = { department: departmentId };
    if (filters.year) query.year = filters.year;
    if (filters.semester) query.semester = filters.semester;
    return await Section.find(query).sort({ year: 1, semester: 1, sectionName: 1 });
  }

  async createSection(departmentId, data) {
    const { year, semester, sectionName } = data;
    const existing = await Section.findOne({ department: departmentId, year, semester, sectionName });
    if (existing) {
      throw new Error(`Section ${sectionName} already exists for Year ${year}, Semester ${semester}.`);
    }
    const section = new Section({ department: departmentId, year, semester, sectionName });
    return await section.save();
  }

  async updateSection(departmentId, sectionId, data) {
    const section = await Section.findOne({ _id: sectionId, department: departmentId });
    if (!section) throw new Error('Section not found or unauthorized.');

    const { year, semester, sectionName } = data;
    if (year) section.year = year;
    if (semester) section.semester = semester;
    if (sectionName) section.sectionName = sectionName;

    return await section.save();
  }

  async deleteSection(departmentId, sectionId) {
    const section = await Section.findOneAndDelete({ _id: sectionId, department: departmentId });
    if (!section) throw new Error('Section not found or unauthorized.');
    return section;
  }

  async getSubjects(departmentId, filters = {}) {
    const query = { department: departmentId };
    if (filters.year) query.year = filters.year;
    if (filters.semester) query.semester = filters.semester;
    return await Subject.find(query).sort({ year: 1, semester: 1, subjectName: 1 });
  }

  async createSubject(departmentId, data) {
    const { year, semester, subjectName, subjectCode } = data;
    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      throw new Error(`Subject with code ${subjectCode} already exists.`);
    }
    const subject = new Subject({ department: departmentId, year, semester, subjectName, subjectCode });
    return await subject.save();
  }

  async updateSubject(departmentId, subjectId, data) {
    const subject = await Subject.findOne({ _id: subjectId, department: departmentId });
    if (!subject) throw new Error('Subject not found or unauthorized.');

    const { year, semester, subjectName, subjectCode } = data;
    if (year) subject.year = year;
    if (semester) subject.semester = semester;
    if (subjectName) subject.subjectName = subjectName;
    if (subjectCode) {
      const existing = await Subject.findOne({ subjectCode, _id: { $ne: subjectId } });
      if (existing) throw new Error(`Subject with code ${subjectCode} already exists.`);
      subject.subjectCode = subjectCode;
    }

    return await subject.save();
  }

  async deleteSubject(departmentId, subjectId) {
    const subject = await Subject.findOneAndDelete({ _id: subjectId, department: departmentId });
    if (!subject) throw new Error('Subject not found or unauthorized.');
    return subject;
  }
}

module.exports = new AcademicService();
