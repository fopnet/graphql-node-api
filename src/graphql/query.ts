import { panelQueries } from './resources/panel/panel.schema';
import { userQueries } from './resources/user/user.schema';

const Query = `
    type Query {
        ${panelQueries}
        ${userQueries}
    }
`;

export {
    Query
}