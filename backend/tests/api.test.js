const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Task = require('../src/models/Task');
const dbConfig = require('../src/config/db');

describe('Project 75 Backend API Integration Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // Health Check Endpoint Tests
  // ==========================================
  describe('GET /api/health', () => {
    it('should return 200 and healthy status when database is connected', async () => {
      jest.spyOn(dbConfig, 'getDBStatus').mockReturnValue({
        state: 'connected',
        isConnected: true,
        name: 'taskdb',
      });

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service', 'project75-production-backend');
      expect(res.body.database).toEqual({
        status: 'connected',
        connected: true,
        name: 'taskdb',
      });
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptimeSeconds');
    });

    it('should return 503 and degraded status when database is disconnected', async () => {
      jest.spyOn(dbConfig, 'getDBStatus').mockReturnValue({
        state: 'disconnected',
        isConnected: false,
        name: null,
      });

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty('status', 'degraded');
      expect(res.body.database.connected).toBe(false);
    });
  });

  // ==========================================
  // Task Management Endpoints Tests
  // ==========================================
  describe('GET /api/tasks', () => {
    it('should return 200 and list of tasks', async () => {
      const mockTasks = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Deploy to EC2',
          description: 'Deploy project safely alongside Project 20',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      jest.spyOn(Task, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks),
      });

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Deploy to EC2');
    });

    it('should support filter query ?completed=true', async () => {
      const mockFind = jest.spyOn(Task, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get('/api/tasks?completed=true');

      expect(res.statusCode).toBe(200);
      expect(mockFind).toHaveBeenCalledWith({ completed: true });
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully with 201 status', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockCreatedTask = {
        _id: fakeId,
        title: 'Configure Nginx Reverse Proxy',
        description: 'Set up upstream proxying for /api and /',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(Task, 'create').mockResolvedValue(mockCreatedTask);

      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: '  Configure Nginx Reverse Proxy  ',
          description: 'Set up upstream proxying for /api and /',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Configure Nginx Reverse Proxy');
      expect(Task.create).toHaveBeenCalledWith({
        title: 'Configure Nginx Reverse Proxy',
        description: 'Set up upstream proxying for /api and /',
        completed: false,
      });
    });

    it('should reject creation when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'Missing title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Task title is required/);
    });

    it('should reject creation when title is blank whitespace', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '    ' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/cannot be blank/);
    });

    it('should reject creation when title exceeds 120 characters', async () => {
      const longTitle = 'a'.repeat(121);
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/cannot exceed 120 characters/);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return 400 when task ID format is invalid', async () => {
      const res = await request(app).get('/api/tasks/invalid-id-123');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid task ID format/);
    });

    it('should return 404 when task is not found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(Task, 'findById').mockResolvedValue(null);

      const res = await request(app).get(`/api/tasks/${validId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/was not found/);
    });

    it('should return 200 and task details when task exists', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockTask = {
        _id: validId,
        title: 'Inspect Docker logs',
        description: 'Verify container health',
        completed: true,
      };

      jest.spyOn(Task, 'findById').mockResolvedValue(mockTask);

      const res = await request(app).get(`/api/tasks/${validId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Inspect Docker logs');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    const validId = new mongoose.Types.ObjectId().toString();

    it('should return 400 when no update fields are provided', async () => {
      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/At least one field.*must be provided/);
    });

    it('should update task and return 200', async () => {
      const updatedTask = {
        _id: validId,
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true,
      };

      jest.spyOn(Task, 'findByIdAndUpdate').mockResolvedValue(updatedTask);

      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ completed: true, title: 'Updated Title' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 404 when updating non-existent task', async () => {
      jest.spyOn(Task, 'findByIdAndUpdate').mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ completed: true });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    const validId = new mongoose.Types.ObjectId().toString();

    it('should return 400 if ID is invalid', async () => {
      const res = await request(app).delete('/api/tasks/not-a-mongo-id');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if task to delete does not exist', async () => {
      jest.spyOn(Task, 'findByIdAndDelete').mockResolvedValue(null);

      const res = await request(app).delete(`/api/tasks/${validId}`);
      expect(res.statusCode).toBe(404);
    });

    it('should delete task and return 200', async () => {
      jest.spyOn(Task, 'findByIdAndDelete').mockResolvedValue({
        _id: validId,
        title: 'Clean task',
      });

      const res = await request(app).delete(`/api/tasks/${validId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted successfully/);
    });
  });

  describe('Fallback 404 for unknown endpoints', () => {
    it('should return 404 for unmapped endpoints', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Endpoint not found/);
    });
  });
});
