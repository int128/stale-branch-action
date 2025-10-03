import * as Types from './graphql-types.js';

export type ListRefsQueryVariables = Types.Exact<{
  owner: Types.Scalars['String']['input'];
  name: Types.Scalars['String']['input'];
  refPrefix: Types.Scalars['String']['input'];
  afterCursor?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ListRefsQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', refs?: { __typename?: 'RefConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Ref', name: string, associatedPullRequests: { __typename?: 'PullRequestConnection', totalCount: number }, target?:
          | { __typename: 'Blob' }
          | { __typename: 'Commit', committedDate: string }
          | { __typename: 'Tag' }
          | { __typename: 'Tree' }
         | null } | null> | null } | null } | null };
