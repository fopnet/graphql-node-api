import * as DataLoader from "dataloader";
import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";
import { DbConnection } from "../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../models/UserModel";
import { RequestedFields } from "../ast/RequestedFields";
import { UserLoader } from "./UserLoader";
import { PanelInstance } from "../../models/PanelModel";
import { PanelLoader } from "./PanelLoader";

export class DataLoaderFactory {
  constructor(
    private db: DbConnection,
    private requestedFields: RequestedFields,
  ) {}

  getLoaders(): DataLoaders {
    return {
      userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
        (params: DataLoaderParam<number>[]) =>
          UserLoader.batchUsers(this.db.User, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key },
      ),
      panelLoader: new DataLoader<DataLoaderParam<number>, PanelInstance>(
        (params: DataLoaderParam<number>[]) =>
          PanelLoader.batchPanels(this.db.Panel, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key },
      )
    };
  }
}
