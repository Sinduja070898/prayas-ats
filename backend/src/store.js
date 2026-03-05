/**
 * In-memory store for development when MongoDB is not connected.
 * Data resets on server restart.
 */

const users = [];
const applications = [];
const questions = [];
const assessments = [];

let userIdSeq = 1;
let applicationIdSeq = 1;
let questionIdSeq = 1;
let assessmentIdSeq = 1;

// Users (candidates): { id, email, name, password, role, createdAt }
function getUsers() {
  return users;
}

function getUserByEmail(email) {
  const e = (email || '').trim().toLowerCase();
  return users.find((u) => (u.email || '').toLowerCase() === e);
}

function createUser(data) {
  const { email, name, password, role = 'candidate' } = data;
  const user = {
    id: 'u-' + userIdSeq++,
    email: (email || '').trim().toLowerCase(),
    name: (name || '').trim() || email.split('@')[0],
    password: password || '',
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

// Applications: { id, userId, formData, status, submittedAt }
function getApplications() {
  return applications;
}

function getApplicationByUserId(userId) {
  return applications.find((a) => String(a.userId) === String(userId));
}

function getApplicationById(id) {
  return applications.find((a) => String(a.id) === String(id));
}

function saveApplication(userId, formData) {
  const existing = getApplicationByUserId(userId);
  const payload = {
    formData: formData || {},
    status: 'Application Submitted',
    submittedAt: new Date().toISOString(),
  };
  if (existing) {
    Object.assign(existing, payload);
    return existing;
  }
  const newApp = {
    id: 'app-' + applicationIdSeq++,
    userId: String(userId),
    ...payload,
  };
  applications.push(newApp);
  return newApp;
}

function updateApplicationStatus(id, status) {
  const app = getApplicationById(id);
  if (!app) return null;
  app.status = status;
  return app;
}

function updateApplicationStatusByUserId(userId, status) {
  const app = getApplicationByUserId(userId);
  if (!app) return null;
  app.status = status;
  return app;
}

// Questions: { id, text, options, correctIndex, isActive }
function getQuestions(includeCorrect = false) {
  const list = questions.map((q) => {
    const { id, text, options, correctIndex, isActive } = q;
    if (includeCorrect) return { id, text, options, correctIndex, isActive };
    return { id, text, options };
  });
  return list;
}

function getQuestionById(id) {
  return questions.find((q) => String(q.id) === String(id));
}

function addQuestion(data) {
  const { text, options, correctIndex } = data;
  const q = {
    id: 'q-' + questionIdSeq++,
    text: text || '',
    options: Array.isArray(options) ? options : [],
    correctIndex: typeof correctIndex === 'number' ? correctIndex : 0,
    isActive: true,
  };
  questions.push(q);
  return q;
}

function updateQuestion(id, data) {
  const q = getQuestionById(id);
  if (!q) return null;
  if (data.text !== undefined) q.text = data.text;
  if (data.options !== undefined) q.options = data.options;
  if (data.correctIndex !== undefined) q.correctIndex = data.correctIndex;
  if (data.isActive !== undefined) q.isActive = data.isActive;
  return q;
}

function deleteQuestion(id) {
  const i = questions.findIndex((q) => String(q.id) === String(id));
  if (i === -1) return false;
  questions.splice(i, 1);
  return true;
}

// Assessments: { id, candidateId, answers, score, total, submittedAt, timeTakenSeconds }
function getAssessments() {
  return assessments;
}

function getAssessmentByCandidateId(candidateId) {
  return assessments.find((a) => String(a.candidateId) === String(candidateId));
}

function saveAssessment(candidateId, candidateName, answersArray, timeTakenSeconds) {
  const existing = getAssessmentByCandidateId(candidateId);
  if (existing) return existing;

  const qList = questions.filter((q) => q.isActive !== false);
  let score = 0;
  const arr = answersArray || [];
  qList.forEach((q, i) => {
    if (arr[i] !== undefined && arr[i] !== null && arr[i] === q.correctIndex) score++;
  });

  const assessment = {
    id: 'res-' + assessmentIdSeq++,
    candidateId: String(candidateId),
    candidateName: candidateName || '',
    answers: arr,
    score,
    total: qList.length,
    submittedAt: new Date().toISOString(),
    timeTakenSeconds: timeTakenSeconds || null,
  };
  assessments.push(assessment);
  return assessment;
}

module.exports = {
  getUsers,
  getUserByEmail,
  createUser,
  getApplications,
  getApplicationByUserId,
  getApplicationById,
  saveApplication,
  updateApplicationStatus,
  updateApplicationStatusByUserId,
  getQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getAssessments,
  getAssessmentByCandidateId,
  saveAssessment,
};
