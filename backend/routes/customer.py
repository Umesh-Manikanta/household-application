from flask import Blueprint, request, jsonify
from extensions import db
from models import User, Service, ServiceRequest, Review
from routes.decorators import customer_required
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

customer_bp = Blueprint("customer", __name__)


# ─── Search Services ─────────────────────────────────────────────────

@customer_bp.route("/services", methods=["GET"])
@customer_required
def get_services():
    search = request.args.get("search")
    pincode = request.args.get("pincode")

    query = Service.query.filter_by(is_active=True)

    if search:
        query = query.filter(
            Service.name.ilike(f"%{search}%") |
            Service.description.ilike(f"%{search}%")
        )

    services = query.all()

    if pincode:
        # Find professionals in that pincode for each service
        result = []
        for service in services:
            professionals = User.query.filter_by(
                role="professional",
                service_type=service.name,
                is_approved=True,
                is_blocked=False,
                pincode=pincode
            ).all()
            service_dict = service.to_dict()
            service_dict["professionals_available"] = len(professionals)
            result.append(service_dict)
        return jsonify({"services": result}), 200

    return jsonify({"services": [s.to_dict() for s in services]}), 200


# ─── Service Requests ─────────────────────────────────────────────────

@customer_bp.route("/requests", methods=["GET"])
@customer_required
def get_my_requests():
    user_id = get_jwt_identity()
    requests = ServiceRequest.query.filter_by(customer_id=user_id).all()
    return jsonify({"requests": [r.to_dict() for r in requests]}), 200


@customer_bp.route("/requests", methods=["POST"])
@customer_required
def create_request():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("service_id"):
        return jsonify({"error": "service_id is required"}), 400

    service = Service.query.get(data["service_id"])
    if not service or not service.is_active:
        return jsonify({"error": "Service not found or inactive"}), 404

    preferred_date = None
    if data.get("preferred_date"):
        preferred_date = datetime.fromisoformat(data["preferred_date"])

    service_request = ServiceRequest(
        service_id=data["service_id"],
        customer_id=user_id,
        preferred_date=preferred_date,
        remarks=data.get("remarks"),
        status="requested",
    )
    db.session.add(service_request)
    db.session.commit()
    return jsonify({"message": "Request created", "request": service_request.to_dict()}), 201


@customer_bp.route("/requests/<int:request_id>", methods=["PUT"])
@customer_required
def update_request(request_id):
    user_id = get_jwt_identity()
    service_request = ServiceRequest.query.filter_by(
        id=request_id, customer_id=user_id
    ).first_or_404()

    if service_request.status == "closed":
        return jsonify({"error": "Cannot edit a closed request"}), 400

    data = request.get_json()
    if data.get("preferred_date"):
        service_request.preferred_date = datetime.fromisoformat(data["preferred_date"])
    if data.get("remarks"):
        service_request.remarks = data["remarks"]

    db.session.commit()
    return jsonify({"message": "Request updated", "request": service_request.to_dict()}), 200


@customer_bp.route("/requests/<int:request_id>/close", methods=["PATCH"])
@customer_required
def close_request(request_id):
    user_id = get_jwt_identity()
    service_request = ServiceRequest.query.filter_by(
        id=request_id, customer_id=user_id
    ).first_or_404()

    if service_request.status != "assigned":
        return jsonify({"error": "Only assigned requests can be closed"}), 400

    service_request.status = "closed"
    service_request.date_of_completion = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Request closed", "request": service_request.to_dict()}), 200


# ─── Reviews ─────────────────────────────────────────────────────────

@customer_bp.route("/reviews", methods=["POST"])
@customer_required
def post_review():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("service_request_id") or not data.get("rating"):
        return jsonify({"error": "service_request_id and rating are required"}), 400

    if not (1 <= data["rating"] <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    service_request = ServiceRequest.query.filter_by(
        id=data["service_request_id"], customer_id=user_id
    ).first_or_404()

    if service_request.status != "closed":
        return jsonify({"error": "Can only review closed requests"}), 400

    if service_request.review:
        return jsonify({"error": "Review already submitted"}), 409

    review = Review(
        service_request_id=service_request.id,
        customer_id=user_id,
        professional_id=service_request.professional_id,
        rating=data["rating"],
        comment=data.get("comment"),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"message": "Review submitted", "review": review.to_dict()}), 201