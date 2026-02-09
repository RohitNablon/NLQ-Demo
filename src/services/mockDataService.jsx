// Mock Data Service - Provides demo data for all components
// This replaces live backend API calls with pre-computed JSON data

import databasesData from '../mock-data/databases.json';
import insightsData from '../mock-data/insights.json';
import curatedQuestionsData from '../mock-data/curated-questions.json';
import employeeData from '../mock-data/employee.json';
import executiveDashboardData from '../mock-data/executive-dashboard.json';
import executiveSummaryData from '../mock-data/executive-summary-data.json';
import platformIntelligenceData from '../mock-data/platform-intelligence-data.json';

/**
 * Get all available databases
 * @returns {Promise<Array>} Array of database objects
 */
export const getDatabases = async () => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  return databasesData;
};

/**
 * Get database by ID
 * @param {string} dbId - Database  ID
 * @returns {Promise<Object|null>} Database object or null
 */
export const getDatabase = async (dbId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return databasesData.find(db => db.id === dbId) || null;
};

/**
 * Get curated questions for a specific database
 * @param {string} dbId - Database ID (optional, returns all if not provided)
 * @returns {Promise<Array>} Array of question objects
 */
export const getCuratedQuestions = async (dbId = null) => {
  await new Promise(resolve => setTimeout(resolve, 250));

  if (!dbId) return curatedQuestionsData;

  return curatedQuestionsData.filter(q => q.database === dbId);
};

/**
 * Get insights dashboard data for a database
 * @param {string} dbId - Database ID
 * @returns {Promise<Object|null>} Insights object or null
 */
export const getInsights = async (dbId) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return insightsData[dbId] || null;
};

/**
 * Get answer for a question (chat interface)
 * @param {number} questionId - Question ID from curated questions
 * @returns {Promise<Object|null>} Answer object with text, metrics, SQL, agent workflow
 */
export const getAnswer = async (questionId) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1200));

  const answer = qaPairsData[questionId.toString()];

  if (!answer) {
    return {
      text: "I couldn't find a pre-computed answer for that question. In a live system, I would analyze your database and generate a response.",
      metrics: {},
      sql: "",
      chartType: "none",
      followUpQuestions: []
    };
  }

  return answer;
};

/**
 * Get agent workflow trace for a question
 * @param {number} questionId - Question ID
 * @returns {Promise<Object|null>} Agent workflow object
 */
export const getAgentWorkflow = async (questionId) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const qa = qaPairsData[questionId.toString()];
  return qa?.agentWorkflow || null;
};

/**
 * Search questions by text
 * @param {string} searchText - Search query
 * @param {string} dbId - Database ID (optional)
 * @returns {Promise<Array>} Matching questions
 */
export const searchQuestions = async (searchText, dbId = null) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  let questions = curatedQuestionsData;

  if (dbId) {
    questions = questions.filter(q => q.database === dbId);
  }

  const searchLower = searchText.toLowerCase();
  return questions.filter(q =>
    q.question.toLowerCase().includes(searchLower) ||
    q.category.toLowerCase().includes(searchLower)
  );
};

/**
 * Get employee data
 * @returns {Promise<Object>} Employee database data
 */
export const getEmployeeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return employeeData;
};

/**
 * Get executive dashboard data
 * @returns {Promise<Object>} Executive dashboard metrics
 */
export const getExecutiveDashboard = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return executiveDashboardData;
};

/**
 * Get executive summary data (Tab 1 of new dashboard)
 * @returns {Promise<Object>} Executive summary metrics
 */
export const getExecutiveSummary = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return executiveSummaryData;
};

/**
 * Get platform intelligence data (Tab 2 of new dashboard)
 * @returns {Promise<Object>} Platform intelligence metrics
 */
export const getPlatformIntelligence = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return platformIntelligenceData;
};

// Export a default object with all methods
export default {
  getDatabases,
  getDatabase,
  getCuratedQuestions,
  getInsights,
  getAnswer,
  getAgentWorkflow,
  searchQuestions,
  getEmployeeData,
  getExecutiveSummary,
  getPlatformIntelligence
};
