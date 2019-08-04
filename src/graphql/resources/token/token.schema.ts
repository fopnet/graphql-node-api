const tokenTypes = `
    type Token {
        token: String!
    }
`;

const tokenMutations = `
    login(email: String!, password: String!): Token
`;

export {
    tokenTypes,
    tokenMutations
}