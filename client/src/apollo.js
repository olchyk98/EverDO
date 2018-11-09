import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';

import { apiPath } from './apiPath';

const client = new ApolloClient({
    link: createUploadLink({ uri: `${ apiPath }/graphql` }),
    cache: new InMemoryCache()
});

export default client;