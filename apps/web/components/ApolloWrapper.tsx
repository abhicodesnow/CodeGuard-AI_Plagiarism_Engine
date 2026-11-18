"use client";

import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

let apolloClientSingleton: ApolloClient | null = null;

function getApolloClient() {
  if (apolloClientSingleton && typeof window !== "undefined") {
    return apolloClientSingleton;
  }

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
    fetch: async (uri, options) => {
      try {
        return await fetch(uri, options);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return new Promise<Response>(() => {});
        }
        throw err;
      }
    },
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url:
              process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/graphql",
          })
        )
      : null;

  const link =
    typeof window !== "undefined" && wsLink != null
      ? ApolloLink.split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });

  if (typeof window !== "undefined") {
    apolloClientSingleton = client;
  }

  return client;
}

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = getApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}