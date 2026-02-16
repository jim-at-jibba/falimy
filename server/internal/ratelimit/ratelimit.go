package ratelimit

import (
	"sync"
	"time"
)

type entry struct {
	count     int
	windowEnd int64
}

type RateLimiter struct {
	mu          sync.RWMutex
	entries     map[string]*entry
	maxRequests int
	windowMs    int64
}

func New(maxRequests int, windowMs int64) *RateLimiter {
	return &RateLimiter{
		entries:     make(map[string]*entry),
		maxRequests: maxRequests,
		windowMs:    windowMs,
	}
}

func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now().UnixMilli()

	e, exists := rl.entries[key]
	if !exists || now > e.windowEnd {
		rl.entries[key] = &entry{
			count:     1,
			windowEnd: now + rl.windowMs,
		}
		return true
	}

	if e.count >= rl.maxRequests {
		return false
	}

	e.count++
	return true
}
