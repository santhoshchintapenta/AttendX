const academicService = require('../services/academicService');

class AcademicController {
  async getDepartments(req, res) {
    try {
      const departments = await academicService.getDepartments();
      res.json({ success: true, message: 'Departments retrieved successfully', data: departments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSections(req, res) {
    try {
      if (!req.user.department) return res.json({ success: true, message: 'No department assigned', data: [] });
      const filters = {
        year: req.query.year,
        semester: req.query.semester
      };
      const sections = await academicService.getSections(req.user.department, filters);
      res.json({ success: true, message: 'Sections retrieved successfully', data: sections });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSection(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      const section = await academicService.createSection(req.user.department, req.body);
      res.status(201).json({ success: true, message: 'Section created successfully', data: section });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSection(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      const section = await academicService.updateSection(req.user.department, req.params.id, req.body);
      res.json({ success: true, message: 'Section updated successfully', data: section });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSection(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      await academicService.deleteSection(req.user.department, req.params.id);
      res.json({ success: true, message: 'Section deleted successfully', data: {} });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSubjects(req, res) {
    try {
      if (!req.user.department) return res.json({ success: true, message: 'No department assigned', data: [] });
      const filters = {
        year: req.query.year,
        semester: req.query.semester
      };
      const subjects = await academicService.getSubjects(req.user.department, filters);
      res.json({ success: true, message: 'Subjects retrieved successfully', data: subjects });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSubject(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      const subject = await academicService.createSubject(req.user.department, req.body);
      res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSubject(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      const subject = await academicService.updateSubject(req.user.department, req.params.id, req.body);
      res.json({ success: true, message: 'Subject updated successfully', data: subject });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSubject(req, res) {
    try {
      if (!req.user.department) return res.status(403).json({ success: false, message: 'No department assigned to user.' });
      await academicService.deleteSubject(req.user.department, req.params.id);
      res.json({ success: true, message: 'Subject deleted successfully', data: {} });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AcademicController();
