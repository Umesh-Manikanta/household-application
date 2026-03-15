from flask import Blueprint, request, jsonify
from extensions import db
from models import User, ServiceRequest, Review
from routes.decorators import professional_required
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

professional_bp = Blueprint("professional", __name__)


# ─── View Requests ────────────────────────────────────────────────────

@professional_bp.route("/requests", methods=["GET"])
@professional_required
def get_requests():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Show unassigned requests matching professional's service type
    # plus requests already assigned to this professional
    available = ServiceRequest.query.join(ServiceRequest.service).filter(
        ServiceRequest.status == "requested"
    ).all()

    assigned = ServiceRequest.query.filter_by(
        professional_id=user_id
    ).all()

    return jsonify({
        "available_requests": [r.to_dict() for r in available],
        "my_requests": [r.to_dict() for r in assigned],
    }), 200


@professional_bp.route("/requests/<int:request_id>/accept", methods=["PATCH"])
@professional_required
def accept_request(request_id):
    user_id = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(request_id)

    if service_request.status != "requested":
        return jsonify({"error": "Request is no longer available"}), 400

    service_request.professional_id = user_id
    service_request.status = "assigned"
    db.session.commit()
    return jsonify({"message": "Request accepted", "request": service_request.to_dict()}), 200


@professional_bp.route("/requests/<int:request_id>/reject", methods=["PATCH"])
@professional_required
def reject_request(request_id):
    user_id = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(request_id)

    if service_request.professional_id != int(user_id) and service_request.status != "requested":
        return jsonify({"error": "Cannot reject this request"}), 400

    service_request.status = "requested"
    service_request.professional_id = None
    db.session.commit()
    return jsonify({"message": "Request rejected", "request": service_request.to_dict()}), 200


# ─── Profile + Reviews ────────────────────────────────────────────────

@professional_bp.route("/profile", methods=["GET"])
@professional_required
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    reviews = Review.query.filter_by(professional_id=user_id).all()

    avg_rating = 0
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)

    return jsonify({
        "user": user.to_dict(),
        "reviews": [r.to_dict() for r in reviews],
        "avg_rating": round(avg_rating, 2),
    }), 200