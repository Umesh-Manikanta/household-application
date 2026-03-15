from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(256))
    pincode = db.Column(db.String(10))
    role = db.Column(db.String(20), nullable=False)  # admin, customer, professional

    # Professional-only fields (null for customers)
    service_type = db.Column(db.String(100))
    experience = db.Column(db.Integer)
    description = db.Column(db.Text)
    doc_path = db.Column(db.String(256))
    is_approved = db.Column(db.Boolean, default=False)

    # Shared status fields
    is_blocked = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    service_requests_as_customer = db.relationship(
        "ServiceRequest", foreign_keys="ServiceRequest.customer_id", backref="customer", lazy=True
    )
    service_requests_as_professional = db.relationship(
        "ServiceRequest", foreign_keys="ServiceRequest.professional_id", backref="professional", lazy=True
    )
    reviews_given = db.relationship(
        "Review", foreign_keys="Review.customer_id", backref="customer", lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "phone": self.phone,
            "address": self.address,
            "pincode": self.pincode,
            "role": self.role,
            "service_type": self.service_type,
            "experience": self.experience,
            "description": self.description,
            "is_approved": self.is_approved,
            "is_blocked": self.is_blocked,
            "date_created": self.date_created.isoformat(),
        }


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer)  # in minutes
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    service_requests = db.relationship("ServiceRequest", backref="service", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "base_price": self.base_price,
            "time_required": self.time_required,
            "description": self.description,
            "is_active": self.is_active,
        }


class ServiceRequest(db.Model):
    __tablename__ = "service_requests"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    preferred_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="requested")  # requested, assigned, closed, rejected
    remarks = db.Column(db.Text)
    final_price = db.Column(db.Float, nullable=True)

    # Relationship
    review = db.relationship("Review", backref="service_request", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "service_name": self.service.name if self.service else None,
            "customer_id": self.customer_id,
            "customer_name": self.customer.full_name if self.customer else None,
            "professional_id": self.professional_id,
            "professional_name": self.professional.full_name if self.professional else None,
            "date_of_request": self.date_of_request.isoformat(),
            "date_of_completion": self.date_of_completion.isoformat() if self.date_of_completion else None,
            "preferred_date": self.preferred_date.isoformat() if self.preferred_date else None,
            "status": self.status,
            "remarks": self.remarks,
            "final_price": self.final_price,
        }


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey("service_requests.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "service_request_id": self.service_request_id,
            "customer_id": self.customer_id,
            "professional_id": self.professional_id,
            "rating": self.rating,
            "comment": self.comment,
            "date_posted": self.date_posted.isoformat(),
        }