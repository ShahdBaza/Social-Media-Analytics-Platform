// patterns/chain/RequestChain.js
// Chain of Responsibility: Each handler decides to process or pass to next

class Handler {
  constructor() {
    this._next = null;
  }

  setNext(handler) {
    this._next = handler;
    return handler; // enable chaining
  }

  handle(request) {
    if (this._next) return this._next.handle(request);
    return { success: true, request };
  }
}

// Handler 1: Auth Validation
class AuthValidationHandler extends Handler {
  handle(request) {
    if (!request.userId) {
      return { success: false, error: 'Authentication required', code: 401 };
    }
    console.log('[Chain] AuthValidation: passed');
    return super.handle(request);
  }
}

// Handler 2: Rate Limit Check
class RateLimitHandler extends Handler {
  constructor() {
    super();
    this._requests = new Map();
    this._limit = 100; // per minute
  }

  handle(request) {
    const key = `${request.userId}:${Math.floor(Date.now() / 60000)}`;
    const count = (this._requests.get(key) || 0) + 1;
    this._requests.set(key, count);

    if (count > this._limit) {
      return { success: false, error: 'Rate limit exceeded', code: 429 };
    }
    console.log(`[Chain] RateLimit: ${count}/${this._limit}`);
    return super.handle(request);
  }
}

// Handler 3: Data Sanitization
class SanitizationHandler extends Handler {
  handle(request) {
    if (request.data) {
      // Strip potential XSS
      const sanitize = (str) => typeof str === 'string'
        ? str.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/[<>]/g, '')
        : str;

      request.data = Object.fromEntries(
        Object.entries(request.data).map(([k, v]) => [k, sanitize(v)])
      );
      console.log('[Chain] Sanitization: cleaned');
    }
    return super.handle(request);
  }
}

// Handler 4: Business Rule Validation
class BusinessRuleHandler extends Handler {
  handle(request) {
    if (request.type === 'post' && request.data) {
      if (request.data.platform === 'twitter' &&
          request.data.content && request.data.content.length > 280) {
        return {
          success: false,
          error: 'Twitter content exceeds 280 characters',
          code: 422
        };
      }
    }
    console.log('[Chain] BusinessRule: valid');
    return super.handle(request);
  }
}

// Handler 5: Enrichment (adds metadata)
class EnrichmentHandler extends Handler {
  handle(request) {
    request.processedAt = new Date().toISOString();
    request.requestId = `req_${Date.now()}`;
    console.log(`[Chain] Enrichment: request ${request.requestId} enriched`);
    return super.handle(request);
  }
}

// Factory: build the chain
function buildRequestChain() {
  const auth = new AuthValidationHandler();
  const rateLimit = new RateLimitHandler();
  const sanitize = new SanitizationHandler();
  const business = new BusinessRuleHandler();
  const enrich = new EnrichmentHandler();

  auth.setNext(rateLimit).setNext(sanitize).setNext(business).setNext(enrich);
  return auth;
}

module.exports = { buildRequestChain, Handler };
