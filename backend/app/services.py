from datetime import date


def calculate_fine(due_date: date, actual_return_date: date, daily_rate: float = 5.0) -> float:
    overdue_days = (actual_return_date - due_date).days
    if overdue_days <= 0:
        return 0.0
    return max(0.0, overdue_days * daily_rate)
