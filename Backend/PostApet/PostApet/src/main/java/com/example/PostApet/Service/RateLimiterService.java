package com.example.PostApet.Service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {
    private final Map<String, RateLimitRecord> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 10;
    private static final long TIME_WINDOW = 60 * 1000; // 1 minute

    public boolean allowRequest(String clientId) {
        long currentTime = System.currentTimeMillis();
        requestCounts.putIfAbsent(clientId, new RateLimitRecord());
        RateLimitRecord record = requestCounts.get(clientId);

        if (currentTime - record.getLastResetTime() > TIME_WINDOW) {
            record.reset(currentTime);
            return true;
        }

        return record.incrementAndGet() <= MAX_REQUESTS;
    }

    private static class RateLimitRecord {
        private final AtomicInteger count = new AtomicInteger(0);
        private long lastResetTime = System.currentTimeMillis();

        public int incrementAndGet() {
            return count.incrementAndGet();
        }

        public void reset(long currentTime) {
            count.set(0);
            lastResetTime = currentTime;
        }

        public long getLastResetTime() {
            return lastResetTime;
        }
    }
}