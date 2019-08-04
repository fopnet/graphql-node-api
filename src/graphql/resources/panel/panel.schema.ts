const panelTypes = `

    type Panel {
        id: ID!
        data_provider: String!
        installation_date: String!
        system_size: Float!
        zip_code: String!
        state: String!
        cost: Float!
    }

    input PanelInput {
        data_provider: String!
        installation_date: String!
        system_size: Float!
        zip_code: String!
        state: String!
        cost: Float!
    }

`;

const panelQueries = `
    panels(first: Int, offset: Int): [ Panel! ]!
    panel(id: ID!): Panel
`;

const panelMutations = `
    createPanel(input: PanelInput!): Panel
    updatePanel(id: ID!, input: PanelInput!): Panel
    deletePanel(id: ID!): Boolean
`;

export {
    panelTypes,
    panelQueries,
    panelMutations
}