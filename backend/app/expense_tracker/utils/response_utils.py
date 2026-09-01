from fastapi import HTTPException


def success_response(message: str | None = None, **data) -> dict:
    response = {"success": True}
    if message:
        response["message"] = message
    response.update(data)
    return response


def not_found(message: str = "Resource not found.") -> None:
    raise HTTPException(status_code=404, detail=message)
