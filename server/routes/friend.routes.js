const express = require('express');
const router = express.Router();

const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getFriendRequests,
  getFriends,
  searchUsers,
} = require('../controllers/friend.controller');

const { verifyJWT } = require('../middlewares/auth.middleware');

// All friend routes require authentication
router.use(verifyJWT);

router.get('/', getFriends);
router.get('/requests', getFriendRequests);
router.get('/search', searchUsers);
router.post('/request/:userId', sendRequest);
router.put('/accept/:requestId', acceptRequest);
router.put('/reject/:requestId', rejectRequest);
router.delete('/:friendId', removeFriend);

module.exports = router;
