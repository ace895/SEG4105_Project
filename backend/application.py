"""
AWS Elastic Beanstalk entry point.
EB looks for an 'application' object by default.
"""

from app.server import app as application

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=8080, debug=False)
