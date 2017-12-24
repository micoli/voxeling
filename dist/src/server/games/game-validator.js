"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
exports.createGameModel = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required()
});
exports.updateGameModel = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    completed: Joi.boolean()
});
