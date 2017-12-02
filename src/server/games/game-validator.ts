import * as Joi from "joi";

export const createGameModel = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required()
});

export const updateGameModel = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    completed: Joi.boolean()
});