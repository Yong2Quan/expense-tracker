"""End-to-end tests for the expense tracker API."""


class TestHealth:
    def test_health_returns_ok(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "ok"}


class TestCategories:
    def test_create(self, client):
        response = client.post("/categories/", json={"name": "Transport", "colour": "#3B82F6"})
        assert response.status_code == 201
        body = response.get_json()
        assert body["name"] == "Transport"
        assert body["colour"] == "#3B82F6"
        assert isinstance(body["id"], int)

    def test_create_uses_default_colour(self, client):
        body = client.post("/categories/", json={"name": "Misc"}).get_json()
        assert body["colour"] == "#6366F1"

    def test_duplicate_name_rejected(self, client, category):
        response = client.post("/categories/", json={"name": category["name"]})
        assert response.status_code == 400

    def test_blank_name_rejected(self, client):
        assert client.post("/categories/", json={"name": "   "}).status_code == 400

    def test_list_sorted_by_name(self, client):
        for name in ("Zebra", "Apple", "Mango"):
            client.post("/categories/", json={"name": name})
        names = [c["name"] for c in client.get("/categories/").get_json()]
        assert names == ["Apple", "Mango", "Zebra"]

    def test_delete(self, client, category):
        assert client.delete(f"/categories/{category['id']}").status_code == 204
        assert client.get("/categories/").get_json() == []

    def test_delete_missing_returns_404(self, client):
        assert client.delete("/categories/9999").status_code == 404


class TestExpenses:
    def test_create(self, client, category):
        response = client.post(
            "/expenses/",
            json={"amount": 12.50, "date": "2026-10-11", "note": "Lunch",
                  "category_id": category["id"]},
        )
        assert response.status_code == 201
        body = response.get_json()
        assert body["amount"] == 12.50
        assert body["date"] == "2026-10-11"
        assert body["note"] == "Lunch"
        assert body["category"]["name"] == category["name"]

    def test_note_is_optional(self, client, category):
        body = client.post(
            "/expenses/",
            json={"amount": 3, "date": "2026-10-11", "category_id": category["id"]},
        ).get_json()
        assert body["note"] is None

    def test_malformed_date_returns_400_not_500(self, client, category):
        """Regression: this used to raise a SQLAlchemy TypeError and 500."""
        response = client.post(
            "/expenses/",
            json={"amount": 5, "date": "not-a-date", "category_id": category["id"]},
        )
        assert response.status_code == 400
        assert "YYYY-MM-DD" in response.get_json()["error"]

    def test_missing_date_returns_400(self, client, category):
        response = client.post("/expenses/", json={"amount": 5, "category_id": category["id"]})
        assert response.status_code == 400

    def test_negative_amount_rejected(self, client, category):
        response = client.post(
            "/expenses/",
            json={"amount": -5, "date": "2026-10-11", "category_id": category["id"]},
        )
        assert response.status_code == 400

    def test_zero_amount_rejected(self, client, category):
        response = client.post(
            "/expenses/",
            json={"amount": 0, "date": "2026-10-11", "category_id": category["id"]},
        )
        assert response.status_code == 400

    def test_unknown_category_returns_404(self, client):
        response = client.post(
            "/expenses/",
            json={"amount": 5, "date": "2026-10-11", "category_id": 9999},
        )
        assert response.status_code == 404

    def test_non_integer_category_returns_400(self, client):
        response = client.post(
            "/expenses/",
            json={"amount": 5, "date": "2026-10-11", "category_id": "abc"},
        )
        assert response.status_code == 400

    def test_list_is_newest_first(self, client, category):
        for day in ("2026-10-01", "2026-10-20", "2026-10-10"):
            client.post("/expenses/", json={"amount": 1, "date": day,
                                            "category_id": category["id"]})
        dates = [e["date"] for e in client.get("/expenses/").get_json()]
        assert dates == ["2026-10-20", "2026-10-10", "2026-10-01"]

    def test_delete(self, client, category):
        created = client.post(
            "/expenses/",
            json={"amount": 5, "date": "2026-10-11", "category_id": category["id"]},
        ).get_json()
        assert client.delete(f"/expenses/{created['id']}").status_code == 204
        assert client.get("/expenses/").get_json() == []

    def test_delete_missing_returns_404(self, client):
        assert client.delete("/expenses/9999").status_code == 404


class TestCascade:
    def test_deleting_category_removes_its_expenses(self, client, category):
        """Regression: this used to 500 with a NOT NULL constraint error."""
        client.post("/expenses/", json={"amount": 9.99, "date": "2026-10-11",
                                        "category_id": category["id"]})
        assert client.get("/expenses/").get_json() != []

        assert client.delete(f"/categories/{category['id']}").status_code == 204
        assert client.get("/expenses/").get_json() == []


class TestErrorFormat:
    def test_errors_are_json_not_html(self, client):
        """The mobile client parses JSON, so errors must not be HTML pages."""
        response = client.delete("/categories/9999")
        assert response.status_code == 404
        assert response.is_json
        assert "error" in response.get_json()
