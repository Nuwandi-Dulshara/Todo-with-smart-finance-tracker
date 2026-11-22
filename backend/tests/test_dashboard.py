from uuid import uuid4

import pytest

BASE = "/api/v1/dashboard"
TASK = {
    "title": "Ship proposal",
    "category": "Work",
    "priority": "High",
    "dueDate": "2026-11-22",
}
TRANSACTION = {
    "title": "Supplies",
    "amount": 12.35,
    "type": "expense",
    "category": "Other",
    "date": "2026-11-22",
}


def register(client, email="owner@example.com"):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Dashboard Owner",
            "email": email,
            "password": "SecurePass!1",
        },
    )
    assert response.status_code == 201
    return response.json()


@pytest.mark.parametrize(
    "method,path,payload",
    [
        ("get", BASE, None),
        ("post", BASE + "/tasks", TASK),
        ("patch", BASE + "/tasks/" + str(uuid4()), {"completed": True}),
        ("post", BASE + "/transactions", TRANSACTION),
        ("put", BASE + "/budget", {"month": "2026-11", "amount": 500}),
        ("patch", BASE + "/widgets", {"tasks": False}),
    ],
)
def test_dashboard_requires_authentication(client, method, path, payload):
    kwargs = {} if payload is None else {"json": payload}
    assert client.request(method, path, **kwargs).status_code == 401


def test_new_account_is_empty_and_profile_is_real(client):
    user = register(client)
    response = client.get(BASE, params={"month": "2026-11"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"] == user
    assert data["tasks"] == []
    assert data["transactions"] == []
    assert data["monthlyBudget"] == 0
    assert len(data["widgets"]) == 9
    assert all(data["widgets"].values())


def test_tasks_transactions_budget_and_widgets_survive_reload(client):
    register(client)
    response = client.post(BASE + "/tasks", json=TASK)
    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "Ship proposal"
    assert task["dueDate"] == "2026-11-22"
    assert task["completed"] is False
    assert task["createdAt"]
    response = client.patch(BASE + "/tasks/" + task["id"], json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] is True
    response = client.post(
        BASE + "/transactions", json={**TRANSACTION, "taskId": task["id"]}
    )
    assert response.status_code == 201
    transaction = response.json()
    assert transaction["amount"] == 12.35
    assert transaction["taskId"] == task["id"]
    assert (
        client.put(
            BASE + "/budget", json={"month": "2026-11", "amount": 1234.56}
        ).status_code
        == 200
    )
    assert client.patch(BASE + "/widgets", json={"tasks": False}).status_code == 200
    assert client.patch(BASE + "/widgets", json={"weekly": False}).status_code == 200

    client.cookies.clear()
    assert (
        client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "SecurePass!1"},
        ).status_code
        == 200
    )
    data = client.get(BASE, params={"month": "2026-11"}).json()
    assert data["tasks"][0]["completed"] is True
    assert data["transactions"] == [transaction]
    assert data["monthlyBudget"] == 1234.56
    assert data["widgets"]["tasks"] is False
    assert data["widgets"]["weekly"] is False
    assert data["widgets"]["finances"] is True
    assert client.get(BASE, params={"month": "2026-12"}).json()["monthlyBudget"] == 0
    assert (
        client.put(BASE + "/budget", json={"month": "2026-11", "amount": 0}).status_code
        == 200
    )
    assert client.get(BASE, params={"month": "2026-11"}).json()["monthlyBudget"] == 0


def test_other_account_cannot_read_modify_or_link_owned_data(client):
    owner = register(client)
    task = client.post(BASE + "/tasks", json=TASK).json()
    client.post(BASE + "/transactions", json=TRANSACTION)
    client.put(BASE + "/budget", json={"month": "2026-11", "amount": 100})
    client.patch(BASE + "/widgets", json={"tasks": False})
    client.cookies.clear()
    register(client, "other@example.com")
    data = client.get(BASE, params={"month": "2026-11"}).json()
    assert data["tasks"] == data["transactions"] == []
    assert data["monthlyBudget"] == 0
    assert data["widgets"]["tasks"] is True
    assert (
        client.patch(
            BASE + "/tasks/" + task["id"], json={"completed": True}
        ).status_code
        == 404
    )
    assert (
        client.post(
            BASE + "/transactions", json={**TRANSACTION, "taskId": task["id"]}
        ).status_code
        == 404
    )
    assert (
        client.post(BASE + "/tasks", json={**TASK, "userId": owner["id"]}).status_code
        == 422
    )
    assert client.get(BASE).json()["transactions"] == []
    client.cookies.clear()
    client.post(
        "/api/v1/auth/login",
        json={"email": "owner@example.com", "password": "SecurePass!1"},
    )
    assert client.get(BASE).json()["tasks"][0]["completed"] is False


@pytest.mark.parametrize(
    "field,value",
    [
        ("amount", 0),
        ("amount", -1),
        ("amount", "NaN"),
        ("amount", 1.001),
        ("amount", 10000000000),
        ("title", "  "),
        ("date", "2026-02-30"),
        ("type", "invalid"),
    ],
)
def test_invalid_transactions_are_not_saved(client, field, value):
    register(client)
    assert (
        client.post(
            BASE + "/transactions", json={**TRANSACTION, field: value}
        ).status_code
        == 422
    )
    assert client.get(BASE).json()["transactions"] == []


def test_invalid_settings_and_missing_task_are_rejected(client):
    register(client)
    assert client.post(BASE + "/tasks", json={**TASK, "title": " "}).status_code == 422
    assert (
        client.patch(
            BASE + "/tasks/" + str(uuid4()), json={"completed": True}
        ).status_code
        == 404
    )
    assert (
        client.put(
            BASE + "/budget", json={"month": "2026-13", "amount": 10}
        ).status_code
        == 422
    )
    assert client.get(BASE, params={"month": "2026-00"}).status_code == 422
    assert client.patch(BASE + "/widgets", json={"unknown": True}).status_code == 422
    assert client.patch(BASE + "/widgets", json={"tasks": "false"}).status_code == 422
    assert (
        client.post(
            BASE + "/transactions",
            json={**TRANSACTION, "type": "income", "taskId": str(uuid4())},
        ).status_code
        == 422
    )


def test_invalid_session_cannot_load_dashboard(client):
    register(client)
    client.cookies.clear()
    client.cookies.set("organix_access_token", "invalid-token")
    assert client.get(BASE).status_code == 401


@pytest.mark.parametrize(
    "resource,payload", [("tasks", TASK), ("transactions", TRANSACTION)]
)
def test_retry_after_lost_response_does_not_duplicate_records(
    client, resource, payload
):
    register(client)
    headers = {"Idempotency-Key": str(uuid4())}
    first = client.post(BASE + "/" + resource, json=payload, headers=headers)
    retry = client.post(BASE + "/" + resource, json=payload, headers=headers)
    assert first.status_code == retry.status_code == 201
    assert first.json()["id"] == retry.json()["id"]
    assert len(client.get(BASE).json()[resource]) == 1
    changed = client.post(
        BASE + "/" + resource,
        json={**payload, "title": "Different request"},
        headers=headers,
    )
    assert changed.status_code == 409
    client.cookies.clear()
    register(client, "second@example.com")
    other = client.post(BASE + "/" + resource, json=payload, headers=headers)
    assert other.status_code == 201
    assert other.json()["id"] != first.json()["id"]


def test_database_outage_has_safe_retryable_error_and_cors(client):
    from sqlalchemy.exc import OperationalError

    from app.db.database import get_db
    from app.main import app

    register(client)
    original = app.dependency_overrides[get_db]

    def unavailable_database():
        raise OperationalError(
            "SELECT secret", {}, Exception("private database connection details")
        )
        yield  # pragma: no cover

    app.dependency_overrides[get_db] = unavailable_database
    try:
        response = client.get(BASE, headers={"Origin": "http://localhost:5173"})
        assert response.status_code == 503
        assert "temporarily unavailable" in response.json()["detail"]
        assert "private" not in response.text
        assert (
            response.headers["access-control-allow-origin"] == "http://localhost:5173"
        )
    finally:
        app.dependency_overrides[get_db] = original
