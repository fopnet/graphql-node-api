import { makeExecutableSchema } from "graphql-tools";
import { merge } from "lodash";

import { Query } from "./query";
import { Mutation } from "./mutation";

import { panelTypes } from "./resources/panel/panel.schema";
import { tokenTypes } from "./resources/token/token.schema";
import { userTypes } from "./resources/user/user.schema";

import { panelResolvers } from "./resources/panel/panel.resolvers";
import { tokenResolvers } from "./resources/token/token.resolvers";
import { userResolvers } from "./resources/user/user.resolvers";

const dataTypes = `
    scalar Date
`;

const resolvers = merge(
  panelResolvers,
  tokenResolvers,
  userResolvers,
);

const SchemaDefinition = `
    type Schema {
        query: Query
        mutation: Mutation
    }
`;

export default makeExecutableSchema({
  typeDefs: [
    SchemaDefinition,
    Query,
    Mutation,
    dataTypes,
    panelTypes,
    tokenTypes,
    userTypes,
  ],
  resolvers,
});
