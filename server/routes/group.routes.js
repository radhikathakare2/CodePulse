const express = require('express');
const router = express.Router();

const {
  createGroup,
  joinGroup,
  leaveGroup,
  inviteMember,
  getGroupDetails,
  getUserGroups,
  getGroupLeaderboard,
  sendMessage,
  getMessages,
  updateGroup,
} = require('../controllers/group.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All group routes require authentication
router.use(verifyJWT);

router.get('/', getUserGroups);
router.post('/', createGroup);
router.post('/join', joinGroup);
router.get('/:id', getGroupDetails);
router.put('/:id', updateGroup);
router.post('/:id/invite', inviteMember);
router.delete('/:id/leave', leaveGroup);
router.get('/:id/leaderboard', getGroupLeaderboard);
router.post('/:id/messages', sendMessage);
router.get('/:id/messages', getMessages);

module.exports = router;
