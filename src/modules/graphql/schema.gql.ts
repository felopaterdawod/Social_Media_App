const users: any[] = [{ username: "mahmoud", }]
import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import { userGQLSchema } from '../user'
import { postGQLSchema } from '../post'



const query = new GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "optional text t enhance  understand api",
    fields: {
        ...userGQLSchema.registerQuery(),
        ...postGQLSchema.registerQuery()

    }
})


const mutation = new GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "optional text t enhance  understand api",
    fields: {
        ...userGQLSchema.registerMutation()

    },
})





export const schema = new GraphQLSchema({ query, mutation })