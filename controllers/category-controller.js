const HttpError = require("../models/http-error");
const Category = require("../models/category-schema");
const Card = require("../models/card-schema");

const createCategory = async (req, res, next) => {
  const { title } = req.body;
  let existingCategory;
  try {
    existingCategory = await Category.findOne({ title: title.toLowerCase() });
  } catch {
    (err) => {
      const error = new HttpError("Something went wrong", 500);
      return next(error);
    };
  }
  if (existingCategory) {
    const error = new HttpError("This category is already added!", 409);
    return next(error);
  }

  const createdCategory = new Category({
    title: title.toLowerCase(),
    cardList: [],
  });
  try {
    await createdCategory.save();
  } catch {
    (err) => {
      const error = new HttpError("Adding category failed", 500);
      return next(error);
    };
  }

  res.status(201).json({
    id: createdCategory.id,
    title: createdCategory.title,
    cardList: createdCategory.cardList,
    createdAt: createdCategory.createdAt,
    updatedAt: createdCategory.updatedAt,
  });
};

const getAllCategory = async (req, res, next) => {
  let categories;
  try {
    categories = await Category.find({});
  } catch {
    (err) => {
      const error = new HttpError("Fetching categories failed", 500);
      return next(error);
    };
  }
  res.status(200).json({
    category: categories.map((cate) => cate.toObject({ getters: true })),
  });
};

const getCategoryById = async (req, res, next) => {
  const id = req.params.id;
  let category;
  try {
    category = await Category.findById(id);
  } catch {
    (err) => {
      const error = new HttpError("Fetching category failed", 500);
      return next(error);
    };
  }
  if (category) {
    res.status(200).json({
      category: category.toObject({ getters: true }),
    });
  } else {
    const error = new HttpError("Category not found", 404);
    return next(error);
  }
};

const updateCategoryById = async (req, res, next) => {
  const { title } = req.body;
  const id = req.params.id;
  let category;
  try {
    category = await Category.findById(id);
  } catch {
    (err) => {
      const error = new HttpError("Fetching category failed", 500);
      return next(error);
    };
  }
  if (!category) {
    const error = new HttpError("Category not found", 404);
    return next(error);
  }

  let existingCategory;
  try {
    existingCategory = await Category.findOne({ title: title.toLowerCase() });
  } catch {
    (err) => {
      const error = new HttpError("Something went wrong", 500);
      return next(error);
    };
  }
  if (existingCategory) {
    const error = new HttpError("Already exists. Cannot update title", 409);
    return next(error);
  }

  category.title = title.toLowerCase();
  try {
    await category.save();
  } catch {
    (err) => {
      const error = new HttpError("Adding category failed", 500);
      return next(error);
    };
  }

  res.status(201).json({
    id: category.id,
    title: category.title,
    cardList: category.cardList,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  });
};

const deleteCategoryById = async (req, res, next) => {
  const id = req.params.id;
  let existingCategory;
  try {
    existingCategory = await Category.findById(id);
  } catch {
    (err) => {
      const error = new HttpError("Fetching category failed", 500);
      return next(error);
    };
  }
  if (!existingCategory) {
    const error = new HttpError("Category not found", 404);
    return next(error);
  }

  let trashCategory;
  try {
    trashCategory = await Category.findOne({ title: "trash" });
  } catch {
    (err) => {
      const error = new HttpError("Fetching trash category failed", 500);
      return next(error);
    };
  }
  if (!trashCategory) {
    const error = new HttpError(
      "Trash category does not exist, please create one first",
      404
    );
    return next(error);
  }

  for (const cardId of existingCategory.cardList) {
    if (!trashCategory.cardList.find((cId) => cId.equals(cardId))) {
      let trashCard;
      try {
        trashCard = await Card.findById(cardId);
      } catch {
        (err) => {
          const error = new HttpError("Fetching trash card failed", 500);
          return next(error);
        };
      }
      if (!trashCard) {
        const error = new HttpError(
          "The card which gonna be in trash category does not exist",
          404
        );
        return next(error);
      }
      try {
        trashCard.categoryId = trashCategory.id;
        await trashCard.save();
      } catch {
        (err) => {
          const error = new HttpError(
            "adding trash category id to card is failed",
            500
          );
          return next(error);
        };
      }

      try {
        trashCategory.cardList.push(cardId);
        await trashCategory.save();
      } catch {
        (err) => {
          const error = new HttpError(
            "Pushing card id to the trash category is failed",
            500
          );
          return next(error);
        };
      }
    }
  }

  try {
    await existingCategory.delete();
  } catch {
    (err) => {
      const error = new HttpError("Deleting category failed", 500);
      return next(error);
    };
  }
  res.status(200).json({
    message: "deleted",
  });
};

exports.createCategory = createCategory;
exports.getAllCategory = getAllCategory;
exports.getCategoryById = getCategoryById;
exports.updateCategoryById = updateCategoryById;
exports.deleteCategoryById = deleteCategoryById;
