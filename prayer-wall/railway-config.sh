#!/bin/bash
# Railway configuration script
# This script fixes the DATABASE_URL format for Spring Boot

if [ -n "$DATABASE_URL" ]; then
  # Convert postgresql:// to jdbc:postgresql://
  export DATABASE_URL="jdbc:${DATABASE_URL#*://}"
  echo "Database URL configured for Spring Boot"
fi

# Start the application
exec java -jar target/prayer-wall-0.0.1-SNAPSHOT.jar
