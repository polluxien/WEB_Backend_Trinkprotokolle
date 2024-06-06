import express from "express";

import {
  createPfleger,
  deletePfleger,
  getAllePfleger,
  updatePfleger,
} from "../services/PflegerService";
import { body, param, validationResult } from "express-validator";

export const pflegerRouter = express.Router();

// Get all Pfleger
pflegerRouter.get("/alle", async (req, res, next) => {
  try {
    const pflegerList = await getAllePfleger();
    res.status(200).send(pflegerList);
  } catch (err) {
    next(err);
  }
});

// neuen Pfleger erstellen
pflegerRouter.post(
  "/",
  body("password").isStrongPassword().isLength({ min: 3, max: 100 }),
  body("name").isString().isLength({ min: 3, max: 100 }),
  body("admin").optional().isBoolean(),
  async (req, res, next) => {
    //Typabfrage
    const pflegerResource = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newPfleger = await createPfleger(pflegerResource);
      res.status(201).send(newPfleger);
    } catch (err) {
      res.status(400).send();
      next(err);
    }
  }
);

// update
pflegerRouter.put(
  "/:id",
  param("id").isMongoId().isLength({ min: 3, max: 100 }),
  body("name").isString().isLength({ min: 3, max: 100 }),
  body("admin").optional().isBoolean(),
  async (req, res, next) => {
    const errors = validationResult(req).array();
    if (req.params!.id !== req.body.id)
      errors.push(
        {
          type: "field",
          location: "params",
          msg: "IDs do not match",
          path: "id",
          value: req.params!.id,
        },
        {
          type: "field",
          location: "body",
          msg: "IDs do not match",
          path: "id",
          value: req.body.id,
        }
      );
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }
    const id = req.params!.id;
    const pflegerResource = req.body;
    pflegerResource.id = id;
    try {
      const updatedPfleger = await updatePfleger(pflegerResource);
      res.status(200).send(updatedPfleger);
    } catch (err) {
      next(err); // Fehler an die Fehler-Middleware weiterleiten
    }
  }
);

// Delete
pflegerRouter.delete(
  "/:id",
  param("id").isMongoId().isLength({ min: 3, max: 100 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
    if (id.length > 100 || id.length < 1) {
      res.status(406).send();
    }

    try {
      await deletePfleger(id);
      res.status(204).send(); // 204 No Content
    } catch (err) {
      next(err);
    }
  }
);