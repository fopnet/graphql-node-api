import { panelMutations } from './resources/panel/panel.schema';
import { tokenMutations } from './resources/token/token.schema';
import { userMutations } from './resources/user/user.schema';

const Mutation = `
    type Mutation {
        ${panelMutations}
        ${tokenMutations}
        ${userMutations}
    }
`;

export { Mutation };
