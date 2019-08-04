const userTypes = `

    # User definition type
    type User {
        id: ID!
        name: String!
        email: String!
        state: String!
        createdAt: String!
        updatedAt: String!
        panels: [Panel]!
    }

    input UserCreateInput {
        name: String!
        email: String!
        state: String!
        password: String!
    }

    input UserUpdateInput {
        name: String!
        email: String!
        state: String!
    }

    input UserUpdatePasswordInput {
        password: String!
    }

`;

const userQueries = `
    users(first: Int, offset: Int): [ User! ]!
    user(id: ID!): User
    currentUser: User
`;

const userMutations = `
    createUser(input: UserCreateInput!): User
    updateUser(input: UserUpdateInput!): User
    deleteUser: Boolean
`;

export { userTypes, userQueries, userMutations };
