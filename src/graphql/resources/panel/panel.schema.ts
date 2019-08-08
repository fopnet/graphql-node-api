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

    input PanelUpdateInput {
        data_provider: String
        installation_date: String
        system_size: Float
        zip_code: String
        state: String
        cost: Float
    }

    type PanelByStateResult {
        state:String!
        amount:Int!
    }
    type PanelCostByZipcodeResult {
        zipcode:String!
        cost:Float!
    }
    type PanelCountTop3ByMonthResult {
        month:String!
        amount:Int!
    }
    type PanelSystemSizeByYearResult {
        year:String!
        size:Float!
    }
      
`;

const panelQueries = `
    panels(first: Int, offset: Int): [ Panel! ]!
    panel(id: ID!): Panel
    panelsCountByState: PanelByStateResult
    panelsTopCostByZipcode: PanelCostByZipcodeResult
    panelsCountTop3ByMonth: [PanelCountTop3ByMonthResult!]
    panelsSystemSizeByYear: [PanelSystemSizeByYearResult!]
`;

const panelMutations = `
    createPanel(input: PanelInput!): Panel
    updatePanel(id: ID!, input: PanelUpdateInput!): Panel
    deletePanel(id: ID!): Boolean
`;

export { panelTypes, panelQueries, panelMutations };
