import { DataLoaders } from "./../../../interfaces/DataLoadersInterface";
import { ComposableResolver } from "./../../composable/composable.resolver";
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { RequestedFields } from "../../ast/RequestedFields";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const userResolvers = {
  User: {
    panels: (
      user: UserInstance,
      { first = 10, offset = 0 },
      {
        db,
        requestedFields,
        dataloaders: { panelLoader },
      }: {
        db: DbConnection;
        requestedFields: RequestedFields;
        dataloaders: DataLoaders;
      },
      info: GraphQLResolveInfo,
    ) => {
      // return panelLoader.load({ key: user.get("state"), info });
      // so funciona se for OneToOne, ou seja se o panels fosse um objeto ex: Post-> autor
      return db.Panel.findAll({
        where: { state: user.get("state") },
        limit: first,
        offset: offset,
        attributes: requestedFields.getFields(info, { keep: ["id"] }),
      }).catch(handleError);
    },
  },

  Query: {
    users: compose(...authResolvers)(
      (
        parent,
        { first = 10, offset = 0 },
        context: ResolverContext,
        info: GraphQLResolveInfo,
      ) => {
        return context.db.User.findAll({
          limit: first,
          offset: offset,
          attributes: context.requestedFields.getFields(info, {
            keep: ["id"],
            exclude: ["panels"],
          }),
        }).catch(handleError);
      },
    ),

    user: (
      parent,
      { id },
      context: ResolverContext,
      info: GraphQLResolveInfo,
    ) => {
      id = parseInt(id);
      return context.db.User.findById(id, {
        attributes: context.requestedFields.getFields(info, {
          keep: ["id"],
          exclude: ["panels"],
        }),
      })
        .then((user: UserInstance) => {
          throwError(!user, `User with id ${id} not found!`);
          return user;
        })
        .catch(handleError);
    },

    currentUser: compose(...authResolvers)(
      (parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
        return context.db.User.findById(context.authUser.id, {
          attributes: context.requestedFields.getFields(info, {
            keep: ["id"],
            exclude: ["panels"],
          }),
        })
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${context.authUser.id} not found!`);
            return user;
          })
          .catch(handleError);
      },
    ),
  },

  Mutation: {
    createUser: (
      parent,
      { input },
      { db }: { db: DbConnection },
      info: GraphQLResolveInfo,
    ) => {
      return db.sequelize
        .transaction((t: Transaction) => {
          return db.User.create(input, { transaction: t });
        })
        .catch(handleError);
    },

    updateUser: compose(...authResolvers)(
      (
        parent,
        { input },
        { db, authUser }: { db: DbConnection; authUser: AuthUser },
        info: GraphQLResolveInfo,
      ) => {
        return db.sequelize
          .transaction((t: Transaction) => {
            return db.User.findById(authUser.id).then((user: UserInstance) => {
              throwError(!user, `User with id ${authUser.id} not found!`);
              return user.update(input, { transaction: t });
            });
          })
          .catch(handleError);
      },
    ),

    deleteUser: compose(...authResolvers)(
      (
        parent,
        args,
        { db, authUser }: { db: DbConnection; authUser: AuthUser },
        info: GraphQLResolveInfo,
      ) => {
        return db.sequelize
          .transaction((t: Transaction) => {
            return db.User.findById(authUser.id).then((user: UserInstance) => {
              throwError(!user, `User with id ${authUser.id} not found!`);
              return user.destroy({ transaction: t }).then(usr => !!usr);
            });
          })
          .catch(handleError);
      },
    ),
  },
};
