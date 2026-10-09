import pytest
from app.services.healthengine import calculate_healthengine_score


def test_healthengine_perfect_score():
    """All vitals strictly within healthy physiological thresholds."""
    res = calculate_healthengine_score(
        heart_rate=72.0,
        blood_sugar=95.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        temperature=36.8,
        spo2=98.0
    )
    assert res.score == 100
    assert res.risk_category == "LOW"
    assert res.deductions_total == 0
    assert len(res.deductions) == 0


def test_healthengine_bradycardia():
    """Heart rate < 50 triggers -18 points deduction."""
    res = calculate_healthengine_score(
        heart_rate=45.0,
        blood_sugar=95.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        temperature=36.8,
        spo2=98.0
    )
    assert res.score == 82
    assert res.risk_category == "MODERATE"
    assert res.deductions_total == 18
    assert res.deductions[0].rule_id == "HR_LOW"


def test_healthengine_tachycardia():
    """Heart rate > 110 triggers -18 points deduction."""
    res = calculate_healthengine_score(
        heart_rate=120.0,
        blood_sugar=95.0,
        systolic_bp=120.0,
        diastolic_bp=80.0,
        temperature=36.8,
        spo2=98.0
    )
    assert res.score == 82
    assert res.risk_category == "MODERATE"
    assert res.deductions_total == 18
    assert res.deductions[0].rule_id == "HR_HIGH"


def test_healthengine_heart_rate_boundaries():
    """Test boundary conditions for HR: 50 and 110 should NOT deduct."""
    res_at_50 = calculate_healthengine_score(50.0, 95.0, 120.0, 80.0, 36.8, 98.0)
    assert res_at_50.score == 100

    res_below_50 = calculate_healthengine_score(49.9, 95.0, 120.0, 80.0, 36.8, 98.0)
    assert res_below_50.score == 82

    res_at_110 = calculate_healthengine_score(110.0, 95.0, 120.0, 80.0, 36.8, 98.0)
    assert res_at_110.score == 100

    res_above_110 = calculate_healthengine_score(110.1, 95.0, 120.0, 80.0, 36.8, 98.0)
    assert res_above_110.score == 82


def test_healthengine_hypoglycemia_and_hyperglycemia():
    """Blood sugar < 70 or > 180 triggers -18 points."""
    res_hypo = calculate_healthengine_score(75.0, 65.0, 120.0, 80.0, 36.8, 98.0)
    assert res_hypo.score == 82
    assert res_hypo.deductions[0].rule_id == "SUGAR_LOW"

    res_hyper = calculate_healthengine_score(75.0, 195.0, 120.0, 80.0, 36.8, 98.0)
    assert res_hyper.score == 82
    assert res_hyper.deductions[0].rule_id == "SUGAR_HIGH"

    # Boundaries: 70 and 180 should not deduct
    assert calculate_healthengine_score(75.0, 70.0, 120.0, 80.0, 36.8, 98.0).score == 100
    assert calculate_healthengine_score(75.0, 180.0, 120.0, 80.0, 36.8, 98.0).score == 100


def test_healthengine_hypertension_rules():
    """Systolic >= 140 or Diastolic >= 90 triggers -18 points."""
    # Systolic triggered
    res_sys = calculate_healthengine_score(75.0, 95.0, 140.0, 80.0, 36.8, 98.0)
    assert res_sys.score == 82
    assert res_sys.deductions[0].rule_id == "BP_HYPERTENSION"

    # Diastolic triggered
    res_dia = calculate_healthengine_score(75.0, 95.0, 120.0, 90.0, 36.8, 98.0)
    assert res_dia.score == 82
    assert res_dia.deductions[0].rule_id == "BP_HYPERTENSION"

    # Both triggered together still deduct 18 points (single BP rule deduction)
    res_both = calculate_healthengine_score(75.0, 95.0, 145.0, 95.0, 36.8, 98.0)
    assert res_both.score == 82
    assert len(res_both.deductions) == 1

    # Normal boundary: 139 / 89 should not trigger
    res_normal = calculate_healthengine_score(75.0, 95.0, 139.9, 89.9, 36.8, 98.0)
    assert res_normal.score == 100


def test_healthengine_temperature_fever():
    """Temperature >= 38.0 °C triggers -12 points."""
    res_fever = calculate_healthengine_score(75.0, 95.0, 120.0, 80.0, 38.0, 98.0)
    assert res_fever.score == 88
    assert res_fever.risk_category == "LOW"  # 88 >= 85 is LOW
    assert res_fever.deductions[0].rule_id == "TEMP_FEVER"

    # Below 38.0 does not deduct
    assert calculate_healthengine_score(75.0, 95.0, 120.0, 80.0, 37.9, 98.0).score == 100


def test_healthengine_hypoxemia_spo2():
    """SpO2 < 94% triggers -22 points."""
    res_spo2 = calculate_healthengine_score(75.0, 95.0, 120.0, 80.0, 36.8, 93.0)
    assert res_spo2.score == 78
    assert res_spo2.risk_category == "MODERATE"
    assert res_spo2.deductions[0].rule_id == "SPO2_HYPOXIA"

    # SpO2 94% is healthy cutoff
    assert calculate_healthengine_score(75.0, 95.0, 120.0, 80.0, 36.8, 94.0).score == 100


def test_healthengine_combined_multiple_anomalies():
    """Combined multiple vital deviations testing stratifications."""
    # HR (-18) + Sugar (-18) = 100 - 36 = 64 => HIGH (score < 65)
    res_high = calculate_healthengine_score(125.0, 220.0, 120.0, 80.0, 36.8, 98.0)
    assert res_high.score == 64
    assert res_high.risk_category == "HIGH"
    assert res_high.deductions_total == 36

    # All 5 rules triggered: 100 - (18 + 18 + 18 + 12 + 22) = 100 - 88 = 12
    res_critical = calculate_healthengine_score(
        heart_rate=130.0,       # -18
        blood_sugar=250.0,      # -18
        systolic_bp=160.0,      # -18
        diastolic_bp=100.0,
        temperature=39.0,       # -12
        spo2=88.0               # -22
    )
    assert res_critical.score == 12
    assert res_critical.risk_category == "HIGH"
    assert res_critical.deductions_total == 88
    assert len(res_critical.deductions) == 5


def test_healthengine_score_floor():
    """Ensures score cannot drop below 0."""
    # Simulate extreme hypothetical values
    res = calculate_healthengine_score(150.0, 400.0, 200.0, 120.0, 41.0, 70.0)
    assert res.score >= 0
    assert res.risk_category == "HIGH"
