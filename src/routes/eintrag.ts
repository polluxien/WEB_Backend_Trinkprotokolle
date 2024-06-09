import express from "express";
import {
  createEintrag,
  deleteEintrag,
  getAlleEintraege,
  getEintrag,
  updateEintrag,
} from "../services/EintragService";
import { param, body, validationResult } from "express-validator";
import {
  optionalAuthentication,
  requiresAuthentication,
} from "./authentication";

export const eintragRouter = express.Router();

// Eintrag abrufen
eintragRouter.get(
  "/:id",
  param("id").isMongoId(),
  optionalAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
    try {
      const eintrag = await getEintrag(id);
      res.send(eintrag); // 200 by default
    } catch (err) {
      res.status(404).send(); // not found
      next(err);
    }
  }
);

// Neuen Eintrag erstellen
eintragRouter.post(
  "/",
  body("getraenk").isString().isLength({ min: 1, max: 100 }),
  body("menge").isInt(),
  body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
  body("ersteller").isMongoId(),
  body("protokoll").isMongoId(),
  requiresAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eintragResource = req.body;
    try {
      const newEintrag = await createEintrag(eintragResource);
      res.status(201).send(newEintrag); // 201 Created
    } catch (err) {
      next(err);
    }
  }
);

// Eintrag aktualisieren
eintragRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("id").isMongoId(),
  body("getraenk").isString().isLength({ min: 1, max: 100 }),
  body("menge").isInt(),
  body("kommentar").optional().isString().isLength({ min: 1, max: 1000 }),
  body("ersteller").isMongoId(),
  body("protokoll").isMongoId(),
  requiresAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req).array();
    if (req.params!.id !== req.body.id) {
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
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    const id = req.params!.id;
    const eintragResource = req.body;
    eintragResource.id = id;
    try {
      const updatedEintrag = await updateEintrag(eintragResource);
      res.send(updatedEintrag); // 200 by default
    } catch (err) {
      next(err);
    }
  }
);

// Eintrag löschen
eintragRouter.delete(
  "/:id",
  param("id").isMongoId(),
  requiresAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
    try {
      await deleteEintrag(id);
      res.status(204).send(); // 204 No Content
    } catch (err) {
      next(err);
    }
  }
);

// Alle Einträge eines Protokolls abrufen
eintragRouter.get(
  "/protokoll/:id",
  param("id").isMongoId(),
  optionalAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const protokollId = req.params!.id;
    try {
      const eintraege = await getAlleEintraege(protokollId);
      res.send(eintraege); // 200 by default
    } catch (err) {
      res.status(404).send(); // not found
      next(err);
    }
  }
);
