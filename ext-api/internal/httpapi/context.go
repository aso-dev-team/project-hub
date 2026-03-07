package httpapi

import (
	"context"

	"github.com/example/linear-like/ext-api/internal/model"
)

type contextKey string

const principalContextKey contextKey = "principal"

func withPrincipal(ctx context.Context, principal model.Principal) context.Context {
	return context.WithValue(ctx, principalContextKey, principal)
}

func principalFromContext(ctx context.Context) (model.Principal, bool) {
	principal, ok := ctx.Value(principalContextKey).(model.Principal)
	return principal, ok
}
