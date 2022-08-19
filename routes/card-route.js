const express = require("express");

const cardController = require("../controllers/card-controller");

const router = express.Router();

router.post("/", cardController.createCard);
router.get("/", cardController.getAllCard);
router.get("/:id", cardController.getCardById);
router.get("/category/:id", cardController.getCardByCategoryId);
router.patch("/:id", cardController.updateCardById);
router.delete("/:id", cardController.deleteCardById);

module.exports = router;
