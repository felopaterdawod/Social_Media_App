import { GraphQLString } from "graphql";
import * as UserGQLTypes from './user.type.gql'
import * as UserGQLArgs from './user.args.gql'
import { userResolver, UserResolver } from "./user.resolver";

export class UserGQLSchema {
    private userResolver: UserResolver;
    constructor() {
        this.userResolver = userResolver
    }

    registerQuery() {
        return {
            profile: {
                type: UserGQLTypes.profile,
                args: UserGQLArgs.profile,
                description: "text profile point",
                resolve: this.userResolver.profile
            },
            welcome2: {
                type: GraphQLString,
                description: "text welcome point",
                resolve: () => {
                    return `Hello`
                }
            }
        }
    }

    registerMutation() {
        return {
            like: {
                type: GraphQLString,
                description: "text welcome point",
                resolve: () => {
                    return `Hello`
                }
            }
        }
    }
}

export const userGQLSchema = new UserGQLSchema()