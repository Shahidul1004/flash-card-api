const HttpError = require("../models/http-error");
const Card = require("../models/card-schema");
const Category = require("../models/category-schema");

const createCard = async (req, res, next) => {
  const { title, description, code, categoryId } = req.body;
  let existingCategory;
  try {
    existingCategory = await Category.findById(categoryId);
  } catch {
    (err) => {
      const error = new HttpError("Something went wrong", 500);
      return next(error);
    };
  }
  if (!existingCategory) {
    const error = new HttpError(
      `Category not found. categoryId: ${categoryId}`,
      404
    );
    return next(error);
  }

  const createdCard = new Card({
    title: title,
    description: description,
    code: code,
    categoryId: categoryId,
  });
  try {
    await createdCard.save();
  } catch {
    (err) => {
      const error = new HttpError("Adding card failed", 500);
      return next(error);
    };
  }

  try {
    existingCategory.cardList.push(createdCard.id);
    await existingCategory.save();
  } catch {
    () => {
      const error = new HttpError(
        `card is added to the database but corresponding category is not updated. cardId: ${createdCard?.id}`,
        500
      );
      return next(error);
    };
  }

  res.status(201).json({
    id: createdCard.id,
    title: createdCard.title,
    description: createdCard.description,
    code: createdCard.code,
    categoryId: createdCard.categoryId,
    createdAt: createdCard.createdAt,
    updatedAt: createdCard.updatedAt,
  });
};

const getAllCard = async (req, res, next) => {
  let cards;
  try {
    cards = await Card.find({});
  } catch {
    (err) => {
      const error = new HttpError("Fetching cards failed", 500);
      return next(error);
    };
  }
  res.status(200).json({
    card: cards.map((crd) => crd.toObject({ getters: true })),
  });
};

const getCardById = async (req, res, next) => {
  const id = req.params.id;
  let card;
  try {
    card = await Card.findById(id);
  } catch {
    (err) => {
      const error = new HttpError("Fetching card failed", 500);
      return next(error);
    };
  }
  if (card) {
    res.status(200).json(card.toObject({ getters: true }));
  } else {
    const error = new HttpError("No card found", 404);
    return next(error);
  }
};

const getCardByCategoryId = async (req, res, next) => {
  const id = req.params.id;
  let card;
  try {
    card = await Card.find({ categoryId: id });
  } catch {
    (err) => {
      const error = new HttpError("Fetching card failed", 500);
      return next(error);
    };
  }
  if (card) {
    res.status(200).json(card.map((crd) => crd.toObject({ getters: true })));
  } else {
    const error = new HttpError("No card found", 404);
    return next(error);
  }
};

const updateCardById = async (req, res, next) => {
  const { title, description, code, categoryId } = req.body;
  const id = req.params.id;

  let existingCard;
  try {
    existingCard = await Card.findById(id);
  } catch {
    (err) => {
      const error = new HttpError("fetching card error", 500);
      return next(error);
    };
  }
  if (!existingCard) {
    const error = new HttpError(
      `no card is found for the given card id. cardId: ${id}`,
      404
    );
    return next(error);
  }

  let prevCategory;
  try {
    prevCategory = await Category.findById(existingCard.categoryId);
  } catch {
    (err) => {
      const error = new HttpError(`something went wrong`, 500);
      return next(error);
    };
  }
  if (!prevCategory) {
    const error = new HttpError(
      `current category of the card not found. categoryId: ${existingCard.categoryId}`,
      404
    );
    return next(error);
  }

  if (existingCard.categoryId === categoryId) {
    try {
      existingCard.title = title;
      existingCard.description = description;
      existingCard.code = code;
      await existingCard.save();
    } catch {
      () => {
        const error = new HttpError("saving card failed", 500);
        return next(error);
      };
    }
  } else {
    let newCategory;
    try {
      newCategory = await Category.findById(categoryId);
    } catch {
      (err) => {
        const error = new HttpError(`something went wrong`, 500);
        return next(error);
      };
    }
    if (!newCategory) {
      const error = new HttpError(
        `new category of the card not found. categoryId: ${categoryId}`,
        404
      );
      return next(error);
    }

    if (!newCategory.cardList.find((cId) => cId.equals(id))) {
      try {
        newCategory.cardList.push(id);
        await newCategory.save();
      } catch {
        () => {
          const error = new HttpError(
            "saving card to new category failed",
            500
          );
          return next(error);
        };
      }
    }

    try {
      existingCard.title = title;
      existingCard.description = description;
      existingCard.code = code;
      existingCard.categoryId = categoryId;
      await existingCard.save();
    } catch {
      () => {
        const error = new HttpError("saving card failed", 500);
        return next(error);
      };
    }

    try {
      prevCategory.cardList = prevCategory.cardList.filter(
        (cId) => !cId.equals(id)
      );
      await prevCategory.save();
    } catch {
      () => {
        const error = new HttpError("updating prev category failed", 500);
        return next(error);
      };
    }
  }
  res.status(200).json(existingCard.toObject({ getters: true }));
};

const deleteCardById = async (req, res, next) => {
  const id = req.params.id;
  let existingCard;
  try {
    existingCard = await Card.findById(id);
  } catch {
    (err) => {
      const error = new HttpError(err);
      return next(error);
    };
  }
  if (!existingCard) {
    const error = new HttpError("card not found.", 404);
    return next(error);
  }

  let existingCategory;
  try {
    existingCategory = await Category.findById(existingCard.categoryId);
  } catch {
    (err) => {
      const error = new HttpError(`something went wrong`, 500);
      return next(error);
    };
  }
  if (!existingCategory) {
    const error = new HttpError(
      `card category not found. categoryId: ${existingCard.categoryId}`,
      404
    );
    return next(error);
  }

  try {
    existingCategory.cardList = existingCategory.cardList.filter(
      (cId) => !cId.equals(id)
    );
    await existingCategory.save();
  } catch {
    () => {
      const error = new HttpError("removing card from category error", 500);
      return next(error);
    };
  }

  try {
    await existingCard.delete();
  } catch {
    (err) => {
      const error = new HttpError("card not deleted", 409);
      return next(error);
    };
  }

  res.status(200).json({ message: "deleted" });
};

exports.createCard = createCard;
exports.getAllCard = getAllCard;
exports.getCardById = getCardById;
exports.getCardByCategoryId = getCardByCategoryId;
exports.updateCardById = updateCardById;
exports.deleteCardById = deleteCardById;
