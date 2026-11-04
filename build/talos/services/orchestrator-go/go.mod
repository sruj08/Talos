module github.com/talos/services/orchestrator-go

go 1.24

require (
	github.com/go-chi/chi/v5 v5.5.0
	github.com/talos/sdk/paypal-go-apimatic v0.0.0
	golang.org/x/sync v0.12.0
)

replace github.com/talos/sdk/paypal-go-apimatic => ../../sdk/paypal-go-apimatic
