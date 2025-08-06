// routes/permissionRoutes.js
const express = require("express");
const router = express.Router();
 
// Tree and permissions management
const permissionController = require("../controllers/permissionController");
const User = require("../models/User");

router.get("/tree", permissionController.getPermissionTree);
router.get("/tree/:roleId", permissionController.getPermissionTree);
router.put("/:roleId", permissionController.updateRolePermissions);
router.get("/summary", permissionController.getRolePermissionsSummary);






router.get('/users/:id/permissions',  async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('permissions');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.permissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user permissions
router.put('/users/:id/permissions', async (req, res) => {
  try {
    const { permissions } = req.body;
    
    // Merge with existing permissions to preserve any unspecified fields
    const user = await User.findById(req.params.id);
    const updatedPermissions = {
      ...user.permissions,
      ...permissions
    };
    
    user.permissions = updatedPermissions;
    await user.save();
    
    res.json(user.permissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
















module.exports = router;