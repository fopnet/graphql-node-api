import * as Sequelize from "sequelize";

import { BaseModelInterface } from "../interfaces/BaseModelInterface";
import { ModelsInterface } from "../interfaces/ModelsInterface";

export interface PanelAttributes {
  id?: number;
  installation_date?: string;
  data_provider?: string;
  system_size?: number;
  zip_code?: string;
  state?: string;
  cost?: number;
}

export interface PanelInstance extends Sequelize.Instance<PanelAttributes> {}

export interface PanelModel
  extends BaseModelInterface,
    Sequelize.Model<PanelInstance, PanelAttributes> {}

export default (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes,
): PanelModel => {
  const Panel: PanelModel = sequelize.define(
    "Panel",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      data_provider: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      installation_date: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      system_size: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      zip_code: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: false,
        // references: {
        //   model: "User",
        //   key: "state",
        // },
      },
      cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      tableName: "panels",
    },
  );

  Panel.associate = (models: ModelsInterface): void => {
    // Panel.belongsTo(models.User, {
    //   foreignKey: {
    //     allowNull: false,
    //     field: "state",
    //     name: "state",
    //   }
    // });
  };

  return Panel;
};
