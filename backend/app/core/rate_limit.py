from datetime import date
import threading

class GlobalRateLimiter:
    def __init__(self, daily_limit: int = 100):
        self.daily_limit = daily_limit
        self._lock = threading.Lock()
        self.count = 0
        self.current_date = date.today()

    def _reset_if_new_day(self):
        today = date.today()
        if self.current_date != today:
            self.current_date = today
            self.count = 0

    def get_status(self) -> dict:
        """Returns the current status without incrementing."""
        with self._lock:
            self._reset_if_new_day()
            return {
                "current": self.count,
                "limit": self.daily_limit,
                "remaining": max(0, self.daily_limit - self.count)
            }

    def check_request(self) -> bool:
        """Increments and checks if request is allowed."""
        with self._lock:
            self._reset_if_new_day()
            
            if self.count >= self.daily_limit:
                return False
            
            self.count += 1
            return True

# Singleton instance
limiter = GlobalRateLimiter(daily_limit=100)
