/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from './graphql-types.js';

export type ListRefsQueryVariables = Exact<{
  owner: string;
  name: string;
  refPrefix: string;
  afterCursor?: string | null | undefined;
}>;


export type ListRefsQuery = { repository: { refs: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<{ name: string, associatedPullRequests: { totalCount: number }, target:
          | { __typename: 'Blob' }
          | { __typename: 'Commit', committedDate: string }
          | { __typename: 'Tag' }
          | { __typename: 'Tree' }
         | null } | null> | null } | null } | null };
