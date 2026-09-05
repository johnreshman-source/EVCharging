import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+mysqlconnector://root:password@localhost:3306/voltreserve'
    )
    
    # APIs
    OPENCHARGEMAP_API_KEY = os.getenv('OPENCHARGEMAP_API_KEY', '')
    OPENCHARGEMAP_API_URL = 'https://api.openchargemap.io/v3'
    
    # VoltReserve Station Config
    STATION_LAT = 28.6139  # Example: New Delhi
    STATION_LNG = 77.2090
    STATION_NAME = "VoltReserve Station"
    RESERVATION_TIMEOUT_MINUTES = 30
    RESERVATION_RADIUS_KM = 2
    
    # ESP32 Config
    ESP32_TIMEOUT_SECONDS = 60

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}