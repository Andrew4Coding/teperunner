FROM rust:latest as builder

# Install required system dependencies for Diesel with PostgreSQL
RUN apt-get update && \
    apt-get install -y \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create a new empty shell project
WORKDIR /app
RUN cargo init --bin

# Copy your Cargo.toml and Cargo.lock
COPY Cargo.toml Cargo.lock ./

# This is a dummy build to cache dependencies
RUN mkdir -p src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release

# Copy your source code
COPY src ./src
COPY .env ./

# Touch main.rs to prevent cached release build
RUN touch src/main.rs

# Build for release
RUN cargo build --release

# Use a minimal debian image for runtime
FROM debian:bookworm-slim

# Install runtime dependencies for PostgreSQL
RUN apt-get update && \
    apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy the built binary from the builder stage
COPY --from=builder /app/target/release/teperunner-worker /usr/local/bin/teperunner-worker
COPY --from=builder /app/.env /app/.env

# Set the working directory
WORKDIR /app

# Run the application
CMD ["teperunner-worker"]