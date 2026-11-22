from fastapi.testclient import TestClient

from app.api.auth import ACCESS_TOKEN_COOKIE
from app.core.config import settings


def register_user(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "Test.User@example.com",
            "password": "SecurePass!1",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_registration_creates_account_and_session(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "Test.User@example.com",
            "password": "SecurePass!1",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "test.user@example.com"
    assert response.json()["full_name"] == "Test User"
    assert "password_hash" not in response.json()
    assert ACCESS_TOKEN_COOKIE in response.cookies
    assert "httponly" in response.headers["set-cookie"].lower()

    current_user = client.get("/api/v1/auth/me")
    assert current_user.status_code == 200
    assert current_user.json()["id"] == response.json()["id"]


def test_login_uses_remember_me_cookie_lifetime(client: TestClient):
    user = register_user(client)
    client.cookies.clear()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": user["email"],
            "password": "SecurePass!1",
            "remember_me": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["id"] == user["id"]
    assert (
        f"max-age={settings.REMEMBER_ME_EXPIRE_DAYS * 24 * 60 * 60}"
        in response.headers["set-cookie"].lower()
    )
    assert client.get("/api/v1/auth/me").status_code == 200


def test_duplicate_registration_and_invalid_login_are_rejected(
    client: TestClient,
):
    register_user(client)
    duplicate = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Another User",
            "email": "test.user@example.com",
            "password": "SecurePass!1",
        },
    )
    invalid_login = client.post(
        "/api/v1/auth/login",
        json={"email": "test.user@example.com", "password": "WrongPass!1"},
    )

    assert duplicate.status_code == 409
    assert invalid_login.status_code == 401
    assert invalid_login.json()["detail"] == "Invalid email or password."


def test_registration_rejects_weak_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "weakpassword",
        },
    )

    assert response.status_code == 422
