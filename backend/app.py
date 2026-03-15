from flask import Flask
from config import config_map
from extensions import db, migrate, jwt, cors
from models import User, Service, ServiceRequest, Review
from werkzeug.security import generate_password_hash
import os


def create_app(env="development"):
    app = Flask(__name__)
    app.config.from_object(config_map[env])

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.customer import customer_bp
    from routes.professional import professional_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(customer_bp, url_prefix="/api/customer")
    app.register_blueprint(professional_bp, url_prefix="/api/professional")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Household Services API running"}

    # Seed admin on first run
    with app.app_context():
        db.create_all()
        seed_admin()

    return app


def seed_admin():
    from models import User
    from flask import current_app
    admin = User.query.filter_by(role="admin").first()
    if not admin:
        admin = User(
            username=current_app.config["ADMIN_USERNAME"],
            email=current_app.config["ADMIN_EMAIL"],
            password_hash=generate_password_hash(current_app.config["ADMIN_PASSWORD"]),
            full_name=current_app.config["ADMIN_FULL_NAME"],
            role="admin",
            is_approved=True,
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user seeded.")


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)