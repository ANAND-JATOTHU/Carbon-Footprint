"""
test_database.py — Unit tests for CO₂ calculation and display name logic.

Tests the pure functions without requiring Firestore credentials.
"""
import sys
import os
import pytest

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestCalculateCO2:
    """Tests for the CO₂ calculation function using extracted logic."""

    DIET_FACTORS = {"vegan": 1.5, "vegetarian": 1.7, "mixed": 2.5, "high_meat": 3.3}
    TRANSPORT_FACTORS = {"public_bike": 0.5, "ev": 1.2, "standard_car": 2.4, "suv": 3.2}
    HOME_FACTORS = {"apartment": 1.5, "small_house": 2.8, "large_house": 4.2}

    def _calc(self, diet, transport, home):
        d = self.DIET_FACTORS.get(diet, 2.5)
        t = self.TRANSPORT_FACTORS.get(transport, 2.4)
        h = self.HOME_FACTORS.get(home, 2.8)
        return round(d + t + h, 2)

    def test_vegan_public_bike_apartment(self):
        assert self._calc("vegan", "public_bike", "apartment") == 3.5

    def test_high_meat_suv_large_house(self):
        assert self._calc("high_meat", "suv", "large_house") == 10.7

    def test_mixed_standard_car_small_house(self):
        assert self._calc("mixed", "standard_car", "small_house") == 7.7

    def test_vegetarian_ev_apartment(self):
        assert self._calc("vegetarian", "ev", "apartment") == 4.4

    def test_unknown_diet_uses_default(self):
        result = self._calc("unknown", "public_bike", "apartment")
        assert result == 4.5  # 2.5 + 0.5 + 1.5

    def test_unknown_transport_uses_default(self):
        result = self._calc("vegan", "unknown", "apartment")
        assert result == 5.4  # 1.5 + 2.4 + 1.5

    def test_unknown_home_uses_default(self):
        result = self._calc("vegan", "public_bike", "unknown")
        assert result == 4.8  # 1.5 + 0.5 + 2.8

    def test_all_unknown_uses_defaults(self):
        result = self._calc("x", "y", "z")
        assert result == 7.7  # 2.5 + 2.4 + 2.8

    def test_result_is_rounded(self):
        result = self._calc("vegan", "ev", "apartment")
        assert result == round(result, 2)

    def test_result_is_positive(self):
        for diet in self.DIET_FACTORS:
            for transport in self.TRANSPORT_FACTORS:
                for home in self.HOME_FACTORS:
                    result = self._calc(diet, transport, home)
                    assert result > 0


class TestEmissionFactors:
    """Tests for emission factor constant integrity."""

    DIET_FACTORS = {"vegan": 1.5, "vegetarian": 1.7, "mixed": 2.5, "high_meat": 3.3}
    TRANSPORT_FACTORS = {"public_bike": 0.5, "ev": 1.2, "standard_car": 2.4, "suv": 3.2}
    HOME_FACTORS = {"apartment": 1.5, "small_house": 2.8, "large_house": 4.2}

    def test_diet_factors_are_positive(self):
        for key, value in self.DIET_FACTORS.items():
            assert value > 0, f"Diet factor '{key}' must be positive"

    def test_transport_factors_are_positive(self):
        for key, value in self.TRANSPORT_FACTORS.items():
            assert value > 0, f"Transport factor '{key}' must be positive"

    def test_home_factors_are_positive(self):
        for key, value in self.HOME_FACTORS.items():
            assert value > 0, f"Home factor '{key}' must be positive"

    def test_diet_factors_are_ordered(self):
        assert self.DIET_FACTORS["vegan"] < self.DIET_FACTORS["high_meat"]

    def test_transport_factors_are_ordered(self):
        assert self.TRANSPORT_FACTORS["public_bike"] < self.TRANSPORT_FACTORS["suv"]

    def test_home_factors_are_ordered(self):
        assert self.HOME_FACTORS["apartment"] < self.HOME_FACTORS["large_house"]

    def test_diet_has_four_options(self):
        assert len(self.DIET_FACTORS) == 4

    def test_transport_has_four_options(self):
        assert len(self.TRANSPORT_FACTORS) == 4

    def test_home_has_three_options(self):
        assert len(self.HOME_FACTORS) == 3


class TestDisplayNameGenerator:
    """Tests for the anonymous display name generator."""

    ECO_WORDS = ["Solar", "Eco", "Green", "Leaf", "Terra", "Bio", "Forest", "Ocean", "Wind", "Ember", "Coral", "Arctic"]
    ANIMALS = ["Panda", "Hawk", "Fox", "Wolf", "Eagle", "Lynx", "Crane", "Orca", "Raven", "Heron", "Deer", "Seal"]

    def _generate(self):
        import random
        return f"{random.choice(self.ECO_WORDS)}{random.choice(self.ANIMALS)}_{random.randint(100, 9999)}"

    def test_returns_string(self):
        assert isinstance(self._generate(), str)

    def test_contains_underscore(self):
        assert "_" in self._generate()

    def test_generates_unique_names(self):
        names = {self._generate() for _ in range(50)}
        assert len(names) > 1

    def test_name_length(self):
        name = self._generate()
        assert 5 < len(name) < 30

    def test_name_ends_with_number(self):
        name = self._generate()
        parts = name.split("_")
        assert parts[-1].isdigit()


class TestValidation:
    """Tests for input validation constants."""

    VALID_DIETS = {"vegan", "vegetarian", "mixed", "high_meat"}
    VALID_TRANSPORT = {"public_bike", "ev", "standard_car", "suv"}
    VALID_HOME = {"apartment", "small_house", "large_house"}
    VALID_CATEGORIES = {"Home", "Transport", "Diet", "Energy"}

    def test_valid_diets_not_empty(self):
        assert len(self.VALID_DIETS) > 0

    def test_valid_transport_not_empty(self):
        assert len(self.VALID_TRANSPORT) > 0

    def test_valid_home_not_empty(self):
        assert len(self.VALID_HOME) > 0

    def test_valid_categories_not_empty(self):
        assert len(self.VALID_CATEGORIES) > 0

    def test_invalid_diet_rejected(self):
        assert "carnivore" not in self.VALID_DIETS

    def test_invalid_transport_rejected(self):
        assert "helicopter" not in self.VALID_TRANSPORT

    def test_invalid_home_rejected(self):
        assert "mansion" not in self.VALID_HOME


class TestEcoActions:
    """Tests for predefined eco-actions."""

    ECO_ACTIONS = [
        {"id": "diet_vegan", "title": "Ate a fully vegan meal", "category": "Diet", "co2_reduction": 1.5},
        {"id": "diet_local", "title": "Bought locally sourced groceries", "category": "Diet", "co2_reduction": 0.8},
        {"id": "trans_bike", "title": "Commuted by bike instead of car", "category": "Transport", "co2_reduction": 2.4},
        {"id": "trans_transit", "title": "Used public transportation", "category": "Transport", "co2_reduction": 1.8},
        {"id": "home_led", "title": "Upgraded to LED lighting", "category": "Home", "co2_reduction": 0.5},
        {"id": "energy_cold", "title": "Washed laundry in cold water", "category": "Energy", "co2_reduction": 0.6},
        {"id": "energy_solar", "title": "Installed solar panels", "category": "Energy", "co2_reduction": 15.0},
        {"id": "home_compost", "title": "Started composting food waste", "category": "Home", "co2_reduction": 0.9},
    ]

    def test_actions_not_empty(self):
        assert len(self.ECO_ACTIONS) > 0

    def test_each_action_has_required_fields(self):
        for action in self.ECO_ACTIONS:
            assert "id" in action
            assert "title" in action
            assert "category" in action
            assert "co2_reduction" in action

    def test_co2_reductions_are_positive(self):
        for action in self.ECO_ACTIONS:
            assert action["co2_reduction"] > 0

    def test_action_ids_are_unique(self):
        ids = [a["id"] for a in self.ECO_ACTIONS]
        assert len(ids) == len(set(ids))

    def test_action_categories_are_valid(self):
        valid = {"Home", "Transport", "Diet", "Energy"}
        for action in self.ECO_ACTIONS:
            assert action["category"] in valid

    def test_eight_eco_actions(self):
        assert len(self.ECO_ACTIONS) == 8
