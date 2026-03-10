# Building Distributed Systems: Lessons from the Trenches

Over the past decade, I've built distributed systems that serve millions of users - from payment reconciliation services processing 5,000 recurring payments per hour to warehouse management systems optimizing operations across geographies. Here are the hard-won lessons that textbooks don't teach you.

## The Fundamental Truth

Distributed systems are **fundamentally about managing failure**. Everything else - scaling, performance, consistency - flows from accepting that things will fail and designing around it.

Your network will partition. Your servers will crash. Your database will slow down. Your assumptions will be wrong.

## Lesson 1: Design for Failure, Not Success

### The Fallacies of Distributed Computing

Remember these fallacies, coined by Peter Deutsch:

1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

Every production incident I've debugged violated at least one of these assumptions.

### Practical Example: Circuit Breakers

When calling external services, implement circuit breakers to prevent cascade failures:

```go
type CircuitBreaker struct {
    maxFailures  int
    timeout      time.Duration
    state        State
    failures     int
    lastAttempt  time.Time
    mu           sync.RWMutex
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    if cb.state == StateOpen {
        if time.Since(cb.lastAttempt) > cb.timeout {
            cb.state = StateHalfOpen
        } else {
            return errors.New("circuit breaker is open")
        }
    }

    err := fn()
    cb.lastAttempt = time.Now()

    if err != nil {
        cb.failures++
        if cb.failures >= cb.maxFailures {
            cb.state = StateOpen
        }
        return err
    }

    cb.failures = 0
    cb.state = StateClosed
    return nil
}
```

This pattern saved us during a third-party API outage - instead of all requests timing out (30s each), we failed fast and degraded gracefully.

## Lesson 2: Eventual Consistency is Your Friend

At NTUC Enterprise, we built an attendance system handling 20,000 concurrent check-ins during peak times. The secret? Embracing eventual consistency.

### The Pattern: Write-Ahead Log + Async Processing

1. **Accept the request** and write to a local WAL (Write-Ahead Log)
2. **Return success** immediately  
3. **Process asynchronously** with retries
4. **Update UI** via WebSockets when complete

```go
// Accept check-in request
func (s *AttendanceService) CheckIn(ctx context.Context, studentID string) error {
    // Write to local WAL (fast, reliable)
    event := CheckInEvent{
        StudentID: studentID,
        Timestamp: time.Now(),
        Status:    "pending",
    }
    
    if err := s.wal.Write(event); err != nil {
        return err
    }

    // Return immediately
    // Async processor picks it up
    return nil
}

// Async processor
func (s *AttendanceService) ProcessEvents() {
    for event := range s.wal.Read() {
        if err := s.processWithRetry(event); err != nil {
            // Move to DLQ for manual review
            s.dlq.Add(event, err)
        }
    }
}
```

### Result

- **99.9% success rate** even during peak load
- **Sub-100ms response times**
- **Zero data loss** (WAL persists everything)

## Lesson 3: Observability is Not Optional

You can't fix what you can't see. At Cisco ThousandEyes, we instrumented everything:

### The Three Pillars

**1. Metrics** - What's happening right now?
```go
// Prometheus metrics
requestDuration := prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name: "http_request_duration_seconds",
        Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
    },
    []string{"method", "endpoint", "status"},
)

// Instrument every request
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    defer func() {
        duration := time.Since(start).Seconds()
        requestDuration.WithLabelValues(
            r.Method,
            r.URL.Path,
            strconv.Itoa(w.StatusCode),
        ).Observe(duration)
    }()
    
    h.next.ServeHTTP(w, r)
}
```

**2. Logs** - What happened?
```go
// Structured logging with context
logger.Info("processing_test_request",
    zap.String("router_id", routerID),
    zap.String("test_type", testType),
    zap.String("trace_id", traceID),
    zap.Duration("duration", elapsed),
)
```

**3. Traces** - Where did time go?
```go
// Distributed tracing
ctx, span := tracer.Start(ctx, "process_test")
defer span.End()

span.SetAttributes(
    attribute.String("router.id", routerID),
    attribute.String("test.type", testType),
)

// Spans propagate across service boundaries
```

### The 25,000 Metric Points We Captured Daily

At NTUC, capturing 25k metrics daily meant we could:
- Detect anomalies in <5 minutes
- Debug issues with full context
- Capacity plan with confidence
- Prove SLA compliance

## Lesson 4: Data Consistency Patterns

### Pattern 1: Saga Pattern (Distributed Transactions)

When you need to coordinate across multiple services, use the Saga pattern:

```go
// Saga for order processing
type OrderSaga struct {
    steps []SagaStep
}

type SagaStep struct {
    Execute    func(ctx context.Context) error
    Compensate func(ctx context.Context) error
}

func (s *OrderSaga) Execute(ctx context.Context) error {
    executed := []SagaStep{}
    
    for _, step := range s.steps {
        if err := step.Execute(ctx); err != nil {
            // Compensate in reverse order
            for i := len(executed) - 1; i >= 0; i-- {
                executed[i].Compensate(ctx)
            }
            return err
        }
        executed = append(executed, step)
    }
    
    return nil
}

// Usage
saga := &OrderSaga{
    steps: []SagaStep{
        {
            Execute:    reserveInventory,
            Compensate: releaseInventory,
        },
        {
            Execute:    chargePayment,
            Compensate: refundPayment,
        },
        {
            Execute:    scheduleShipment,
            Compensate: cancelShipment,
        },
    },
}
```

### Pattern 2: Event Sourcing

Store **events** instead of current state. Rebuild state by replaying events.

At HelloFresh, we used this for recipe and SKU management:

```go
// Events
type RecipeCreated struct {
    RecipeID   string
    Name       string
    Timestamp  time.Time
}

type IngredientAdded struct {
    RecipeID   string
    Ingredient Ingredient
    Timestamp  time.Time
}

// Aggregate
type Recipe struct {
    ID          string
    Name        string
    Ingredients []Ingredient
}

func (r *Recipe) Apply(event Event) {
    switch e := event.(type) {
    case RecipeCreated:
        r.ID = e.RecipeID
        r.Name = e.Name
    case IngredientAdded:
        r.Ingredients = append(r.Ingredients, e.Ingredient)
    }
}
```

**Benefits:**
- Complete audit trail
- Time travel (rebuild state at any point)
- Easy to add new projections
- Natural fit for event-driven architecture

## Lesson 5: Backpressure and Rate Limiting

When I joined Airtel Digital, we had a problem: traffic spikes would overwhelm downstream services. The solution? Layers of backpressure.

### Token Bucket Rate Limiter

```go
type TokenBucket struct {
    capacity   int
    tokens     int
    refillRate time.Duration
    mu         sync.Mutex
}

func (tb *TokenBucket) Allow() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func (tb *TokenBucket) refill() {
    ticker := time.NewTicker(tb.refillRate)
    for range ticker.C {
        tb.mu.Lock()
        if tb.tokens < tb.capacity {
            tb.tokens++
        }
        tb.mu.Unlock()
    }
}
```

### Load Shedding

```go
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Shed load if queue is too full
    if h.queue.Len() > h.maxQueueSize {
        http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
        return
    }
    
    // Or shed based on request priority
    priority := r.Header.Get("X-Request-Priority")
    if priority == "low" && h.isOverloaded() {
        http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
        return
    }
    
    h.next.ServeHTTP(w, r)
}
```

## Lesson 6: The Importance of Idempotency

**Every operation in a distributed system should be idempotent.**

At HelloFresh, payment processing had to be idempotent - customers shouldn't be charged twice if a request is retried.

```go
func (s *PaymentService) ProcessPayment(ctx context.Context, req PaymentRequest) error {
    idempotencyKey := req.IdempotencyKey
    
    // Check if already processed
    if result, found := s.cache.Get(idempotencyKey); found {
        return result.Error
    }
    
    // Process payment
    result := s.chargeCard(ctx, req)
    
    // Store result with TTL
    s.cache.Set(idempotencyKey, result, 24*time.Hour)
    
    return result.Error
}
```

## Lesson 7: Cache Carefully

Caching is a double-edged sword. At NTUC, we used Redis master-slave for caching, and learned:

### When to Cache
- Expensive computations
- High-read, low-write data
- Acceptable slight staleness

### When NOT to Cache
- Rapidly changing data
- Data requiring strong consistency
- Small datasets (overhead > benefit)

### Cache Invalidation Strategy

```go
// Write-through cache
func (s *Service) UpdateUser(ctx context.Context, user User) error {
    // Update database
    if err := s.db.Update(user); err != nil {
        return err
    }
    
    // Update cache
    if err := s.cache.Set(user.ID, user); err != nil {
        // Log but don't fail - cache miss is ok
        log.Error("cache_update_failed", zap.Error(err))
    }
    
    return nil
}

// Cache-aside pattern
func (s *Service) GetUser(ctx context.Context, userID string) (*User, error) {
    // Try cache first
    if user, found := s.cache.Get(userID); found {
        return user, nil
    }
    
    // Cache miss - get from DB
    user, err := s.db.Get(userID)
    if err != nil {
        return nil, err
    }
    
    // Populate cache
    s.cache.Set(userID, user)
    
    return user, nil
}
```

## Conclusion

Building distributed systems is hard. There's no silver bullet, no perfect architecture. What works at 1,000 RPS fails at 100,000 RPS.

But these patterns have served me well across industries and scales:

1. **Design for failure**
2. **Embrace eventual consistency**
3. **Observe everything**
4. **Plan for data consistency**
5. **Implement backpressure**
6. **Make operations idempotent**
7. **Cache thoughtfully**

The real lesson? **Start simple, measure everything, and evolve based on real data.** Don't over-engineer for scale you don't have. But do design for the failure modes you'll definitely encounter.

---

**Recommended Reading:**
- *Designing Data-Intensive Applications* by Martin Kleppmann
- *Site Reliability Engineering* by Google
- *Release It!* by Michael Nygard

Questions? War stories to share? Let's connect!
