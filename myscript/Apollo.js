const {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  HttpLink,
} = require("@apollo/client/core");
const fetch = require("isomorphic-fetch");


// REACT_APP_BACKEND_URI="https://dev-be.nextgenwebthree.com/graphql"
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  fetch: fetch,
});

// DEBUG
// const errorLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors)
//     graphQLErrors.forEach(({ message, locations, path }) =>
//       console.error(
//         `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
//       )
//     );
//   if (networkError)
//     console.error(`[Network error]: ${JSON.stringify(networkError, null, 2)})`);
// });

const client = new ApolloClient({
  link: HttpLink.from([httpLink]),
  cache: new InMemoryCache(),
});

// SCHEMAS

const CREATE_REPORT = gql`
  mutation Mutation($payload: CreateScrapyInput!) {
    ScrapUrl(payload: $payload) {
      id
      sessionId
      authorId
    }
  }
`;
module.exports = {
  client,
  CREATE_REPORT,
};
