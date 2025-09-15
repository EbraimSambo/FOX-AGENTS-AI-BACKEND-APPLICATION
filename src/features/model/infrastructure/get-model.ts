import { ModelEnum, ModelType } from "../domain/entity/model.entity";
import { models } from "./model.client";



export const getValueModel = (model: ModelEnum): ModelType => {
    const foundModel = models.find(m => m.model === model);
    
    if (!foundModel) {
      throw new Error(`Modelo não encontrado: ${model}`);
    }
    
    return foundModel;
  };