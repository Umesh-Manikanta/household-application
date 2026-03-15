from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Service, ServiceRequest, Review
from routes.decorators import admin_required
from flask_jwt_extended import get_jwt_identity

admin_bp = Blueprint("admin", __name__)


# ─── User Management ────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    role = request.args.get("role")
    search = request.args.get("search")

    query = User.query.filter(User.role != "admin")

    if role:
        query = query.filter_by(role=role)
    if search:
        query = query.filter(
            User.username.ilike(f"%{search}%") |
            User.full_name.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%")
        )

    users = query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users/<int:user_id>/approve", methods=["PATCH"])
@admin_required
def approve_professional(user_id):
    user = User.query.get_or_404(user_id)

    if user.role != "professional":
        return jsonify({"error": "Only professionals can be approved"}), 400

    user.is_approved = True
    db.session.commit()
    return jsonify({"message": "Professional approved", "user": user.to_dict()}), 200


@admin_bp.route("/users/<int:user_id>/block", methods=["PATCH"])
@admin_required
def block_user(user_id):
    user = User.query.get_or_404(user_id)

    if user.role == "admin":
        return jsonify({"error": "Cannot block admin"}), 400

    user.is_blocked = True
    db.session.commit()
    return jsonify({"message": "User blocked", "user": user.to_dict()}), 200


@admin_bp.route("/users/<int:user_id>/unblock", methods=["PATCH"])
@admin_required
def unblock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_blocked = False
    db.session.commit()
    return jsonify({"message": "User unblocked", "user": user.to_dict()}), 200


# ─── Service Management ─────────────────────────────────────────────

@admin_bp.route("/services", methods=["GET"])
@admin_required
def get_services():
    services = Service.query.all()
    return jsonify({"services": [s.to_dict() for s in services]}), 200


@admin_bp.route("/services", methods=["POST"])
@admin_required
def create_service():
    data = request.get_json()

    required = ["name", "base_price"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if Service.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Service with this name already exists"}), 409

    service = Service(
        name=data["name"],
        base_price=data["base_price"],
        time_required=data.get("time_required"),
        description=data.get("description"),
    )
    db.session.add(service)
    db.session.commit()
    return jsonify({"message": "Service created", "service": service.to_dict()}), 201


@admin_bp.route("/services/<int:service_id>", methods=["PUT"])
@admin_required
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()

    service.name = data.get("name", service.name)
    service.base_price = data.get("base_price", service.base_price)
    service.time_required = data.get("time_required", service.time_required)
    service.description = data.get("description", service.description)
    service.is_active = data.get("is_active", service.is_active)

    db.session.commit()
    return jsonify({"message": "Service updated", "service": service.to_dict()}), 200


@admin_bp.route("/services/<int:service_id>", methods=["DELETE"])
@admin_required
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    service.is_active = False
    db.session.commit()
    return jsonify({"message": "Service deactivated"}), 200


# ─── Dashboard Stats ─────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    total_customers = User.query.filter_by(role="customer").count()
    total_professionals = User.query.filter_by(role="professional").count()
    pending_approvals = User.query.filter_by(role="professional", is_approved=False).count()
    total_services = Service.query.filter_by(is_active=True).count()
    total_requests = ServiceRequest.query.count()
    open_requests = ServiceRequest.query.filter_by(status="requested").count()
    assigned_requests = ServiceRequest.query.filter_by(status="assigned").count()
    closed_requests = ServiceRequest.query.filter_by(status="closed").count()

    return jsonify({
        "total_customers": total_customers,
        "total_professionals": total_professionals,
        "pending_approvals": pending_approvals,
        "total_services": total_services,
        "total_requests": total_requests,
        "open_requests": open_requests,
        "assigned_requests": assigned_requests,
        "closed_requests": closed_requests,
    }), 200