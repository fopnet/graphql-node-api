import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";
import { PanelInstance } from "../../../models/PanelModel";
import { handleError, throwError } from "../../../utils/utils";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import sequelize = require("sequelize");

export const panelResolvers = {
  Query: {
    panels: compose(...authResolvers)(
      (
        parent,
        { first = 10, offset = 0 },
        context: ResolverContext,
        info: GraphQLResolveInfo,
      ) => {
        return context.db.Panel.findAll({
          where: { state: context.authUser.state },
          limit: first,
          offset: offset,
          attributes: context.requestedFields.getFields(info, { keep: ["id"] }),
        }).catch(handleError);
      },
    ),

    panel: compose(...authResolvers)(
      (parent, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
        id = parseInt(id);
        return context.db.Panel.findById(id, {
          attributes: context.requestedFields.getFields(info, {
            keep: ["id"],
          }),
        })
          .then((panel: PanelInstance) => {
            throwError(!panel, `Panel with id ${id} not found!`);
            return panel;
          })
          .catch(handleError);
      },
    ),

    panelsByState: compose(...authResolvers)(
      (parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
        return context.db.Panel.findAll({
          where: { state: context.authUser.state },
          attributes: [
            "state",
            [sequelize.fn("count", sequelize.col("id")), "amount"],
          ],
          group: ["Panel.state"],
        })
          .then((result: any) => {
            throwError(!result, `no results!`);
            return result.map(grp => grp.dataValues);
          })
          .catch(handleError);
      },
    ),
  },

  Mutation: {
    createPanel: compose(...authResolvers)(
      (
        parent,
        { input },
        { db, authUser }: { db: DbConnection; authUser: AuthUser },
        info: GraphQLResolveInfo,
      ) => {
        input.author = authUser.id;
        return db.sequelize
          .transaction((t: Transaction) => {
            return db.Panel.create(input, { transaction: t });
          })
          .catch(handleError);
      },
    ),

    updatePanel: compose(...authResolvers)(
      (
        parent,
        { id, input },
        { db, authUser }: { db: DbConnection; authUser: AuthUser },
        info: GraphQLResolveInfo,
      ) => {
        id = parseInt(id);
        return db.sequelize
          .transaction((t: Transaction) => {
            return db.Panel.findById(id).then((panel: PanelInstance) => {
              throwError(!panel, `Panel with id ${id} not found!`);
              throwError(
                panel.get("state") != authUser.id,
                `Unauthorized! You can only edit panels by yourself!`,
              );
              input.author = authUser.id;
              return panel.update(input, { transaction: t });
            });
          })
          .catch(handleError);
      },
    ),

    deletePanel: compose(...authResolvers)(
      (
        parent,
        { id },
        { db, authUser }: { db: DbConnection; authUser: AuthUser },
        info: GraphQLResolveInfo,
      ) => {
        id = parseInt(id);
        return db.sequelize
          .transaction((t: Transaction) => {
            return db.Panel.findById(id).then((panel: PanelInstance) => {
              throwError(!panel, `Panel with id ${id} not found!`);
              throwError(
                panel.get("state") != authUser.state,
                `Unauthorized! You can only delete panels by yourself!`,
              );
              return panel.destroy({ transaction: t }).then(panel => !!panel);
            });
          })
          .catch(handleError);
      },
    ),
  },
};
