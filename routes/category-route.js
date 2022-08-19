const express = require("express");

const categoryController = require("../controllers/category-controller");

const router = express.Router();

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch("/:id", categoryController.updateCategoryById);
router.delete("/:id", categoryController.deleteCategoryById);

module.exports = router;
