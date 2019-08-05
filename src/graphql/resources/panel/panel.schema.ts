const panelTypes = `

    type Panel {
        id: ID!
        data_provider: String!
        installation_date: Date!    
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

    interface StringIntMap {
        key: String!
        value: Int!
    }

    scalar ObjectScalar
     
    type MapEntry {
        key: String!
        value: [ObjectScalar!]
      }

    type PanelByStateResult {
        state:String!
        amount:Int!
    }
      
`;

const panelQueries = `
    panels(first: Int, offset: Int): [ Panel! ]!
    panel(id: ID!): Panel
    panelsByState: [PanelByStateResult]!
`;

const panelMutations = `
    createPanel(input: PanelInput!): Panel
    updatePanel(id: ID!, input: PanelInput!): Panel
    deletePanel(id: ID!): Boolean
`;

export { panelTypes, panelQueries, panelMutations };
