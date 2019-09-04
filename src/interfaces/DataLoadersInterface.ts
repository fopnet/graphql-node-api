import * as DataLoader from "dataloader";
import { UserInstance } from "../models/UserModel";
import { DataLoaderParam } from "./DataLoaderParamInterface";
import { PanelInstance } from "../models/PanelModel";

export interface DataLoaders {
  userLoader: DataLoader<DataLoaderParam<number>, UserInstance>;
  panelLoader: DataLoader<DataLoaderParam<number>, PanelInstance>;
}
