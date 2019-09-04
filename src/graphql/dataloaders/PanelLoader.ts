import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { PanelInstance, PanelModel } from "../../models/PanelModel";
import { RequestedFields } from "../ast/RequestedFields";

export class PanelLoader {
  static batchPanels(
    Panel: PanelModel,
    params: DataLoaderParam<number>[],
    requestedFields: RequestedFields,
  ): Promise<PanelInstance[]> {
    let ids: number[] = params.map(param => param.key);

    return Promise.resolve(
      Panel.findAll({
        where: { id: { $in: ids } },
        attributes: requestedFields.getFields(params[0].info, {
          keep: ["id"],
        }),
      }),
    );
  }
}
