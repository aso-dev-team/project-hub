const graphqlEndpoint =
  process.env.NEXT_PUBLIC_APP_GRAPHQL_URL ??
  `${process.env.NEXT_PUBLIC_APP_API_URL ?? "http://localhost:5050"}/graphql`;

export interface GraphQLErrorItem {
  message: string;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLErrorItem[];
}

export async function appGraphQLRequest<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables: TVariables,
): Promise<TData> {
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors.map((error) => error.message).join("\n"));
  }

  if (!payload.data) {
    throw new Error("GraphQL response does not contain data.");
  }

  return payload.data;
}
