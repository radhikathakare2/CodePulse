const { body } = require('express-validator');

/**
 * Validator chain for profile update.
 */
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),

  body('college')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('College name cannot exceed 150 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country name is too long'),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'] }).withMessage('GitHub URL must be a valid URL')
    .matches(/^https?:\/\/(www\.)?github\.com\//).withMessage('Please provide a valid GitHub profile URL'),

  body('platformUsernames.leetcode')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('LeetCode username is too long'),

  body('platformUsernames.codeforces')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Codeforces username is too long'),

  body('platformUsernames.gfg')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('GFG username is too long'),
];

module.exports = { updateProfileValidator };
