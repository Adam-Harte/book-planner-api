import express from 'express';
import { body } from 'express-validator';

import { createCharacter } from '../controllers/characters/createCharacter';
import { deleteCharacterById } from '../controllers/characters/deleteCharacterById';
import { getCharacterById } from '../controllers/characters/getCharacterById';
import { getCharacters } from '../controllers/characters/getCharacters';
import { updateCharacterById } from '../controllers/characters/updateCharacterById';
import { authorization } from '../middlewares/authorization';

export const charactersRouter = express.Router();

charactersRouter.get('/characters', authorization, getCharacters);

charactersRouter.post(
  '/characters',
  authorization,
  body('firstName').exists().withMessage('firstName field is required.'),
  createCharacter
);

charactersRouter.get(
  '/characters/:characterId',
  authorization,
  getCharacterById
);

charactersRouter.patch(
  '/characters/:characterId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateCharacterById
);

charactersRouter.delete(
  '/characters/:characterId',
  authorization,
  deleteCharacterById
);
