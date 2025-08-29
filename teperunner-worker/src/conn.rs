use redis::{Client, Connection, RedisError};

pub async fn get_redis_connection() -> Result<Connection, RedisError> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379/".into());
    let client = Client::open(redis_url)?;
    let conn = client.get_connection();
    conn
}
