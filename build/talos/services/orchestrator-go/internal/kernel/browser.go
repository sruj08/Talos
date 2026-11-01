// Package kernel integrates KERNEL (onkernel.com) disposable cloud browser sessions for untrusted merchant DOM extraction.
package kernel

type BrowserSession struct {
	SessionID   string `json:"session_id"`
	MerchantURL string `json:"merchant_url"`
}
