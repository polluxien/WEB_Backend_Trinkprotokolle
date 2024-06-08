import express from "express";
import {
  createProtokoll,
  deleteProtokoll,
  getAlleProtokolle,
  getProtokoll,
  updateProtokoll,
} from "../services/ProtokollService";
import { getAlleEintraege } from "../services/EintragService";
import { body, param, validationResult } from "express-validator";
import {
  optionalAuthentication,
  requiresAuthentication,
} from "./authentication";

export const protokollRouter = express.Router();

// Einträge eines Protokolls abrufen
protokollRouter.get(
  "/:id/eintraege",
  param("id").isMongoId(),
  optionalAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
    try {
      const eintraege = await getAlleEintraege(id);
      res.send(eintraege); // 200 by default
    } catch (err) {
      res.status(404).send(); // not found
      next(err);
    }
  }
);

// Alle Protokolle abrufen
protokollRouter.get("/alle", optionalAuthentication, async (req, res, next) => {
  //const pflegerId = .... blatt 7
  try {
    const protokolle = await getAlleProtokolle(); // hier noch mal prüfen
    res.send(protokolle); // 200 by default
  } catch (err) {
    next(err);
  }
});

// Bestimmtes Protokoll abrufen
protokollRouter.get(
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
      const protokoll = await getProtokoll(id);
      res.send(protokoll); // 200 by default
    } catch (err) {
      res.status(404).send(); // not found
      next(err);
    }
  }
);

// Neues Protokoll erstellen
protokollRouter.post(
  "/",
  body("patient").isString().isLength({ min: 3, max: 100 }),
  body("datum").isString().isLength({ min: 3, max: 100 }),
  body("public").optional().isBoolean(),
  body("closed").optional().isBoolean(),
  body("ersteller").isMongoId(),
  requiresAuthentication,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const protokollResource = req.body;
    try {
      const newProtokoll = await createProtokoll(protokollResource);
      res.status(201).send(newProtokoll); // 201 Created
    } catch (err) {
      next(err);
    }
  }
);

// Bestehendes Protokoll aktualisieren
protokollRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("patient").isString().isLength({ min: 3, max: 100 }),
  body("datum").isString().isLength({ min: 3, max: 100 }),
  body("public").optional().isBoolean(),
  body("closed").optional().isBoolean(),
  body("id").isMongoId(),
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
    const protokollResource = req.body;
    protokollResource.id = id;
    try {
      const updatedProtokoll = await updateProtokoll(protokollResource);
      res.send(updatedProtokoll); // 200 by default
    } catch (err) {
      next(err);
    }
  }
);

// Protokoll löschen
protokollRouter.delete(
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
      await deleteProtokoll(id);
      res.status(204).send(); // 204 No Content
    } catch (err) {
      next(err);
    }
  }
);
