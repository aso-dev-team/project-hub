package config

import "os"

type Config struct {
	Addr                  string
	AppAPIBaseURL         string
	InternalServiceAPIKey string
}

func Load() Config {
	return Config{
		Addr:                  getEnv("EXT_API_ADDR", ":8081"),
		AppAPIBaseURL:         getEnv("APP_API_BASE_URL", "http://localhost:5050"),
		InternalServiceAPIKey: getEnv("INTERNAL_SERVICE_API_KEY", "dev-internal-service-key"),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
