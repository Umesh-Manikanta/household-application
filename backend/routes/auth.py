from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validate required fields
    required = ["username", "email", "password", "full_name", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Only allow customer or professional to register
    if data["role"] not in ["customer", "professional"]:
        return jsonify({"error": "Invalid role"}), 400

    # Check duplicates
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    # Validate professional-specific fields
    if data["role"] == "professional":
        if not data.get("service_type"):
            return jsonify({"error": "service_type is required for professionals"}), 400
        if not data.get("experience"):
            return jsonify({"error": "experience is required for professionals"}), 400

    user = User(
        username=data["username"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
        full_name=data["full_name"],
        phone=data.get("phone") or None,
        address=data.get("address") or None,
        pincode=data.get("pincode") or None,
        role=data["role"],
        service_type=data.get("service_type") or None,
        experience=int(data["experience"]) if data.get("experience") else None,
        description=data.get("description") or None,
        is_approved=False,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data["username"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    if user.is_blocked:
        return jsonify({"error": "Your account has been blocked"}), 403

    # Professionals must be approved before login
    if user.role == "professional" and not user.is_approved:
        return jsonify({"error": "Your account is pending admin approval"}), 403

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200