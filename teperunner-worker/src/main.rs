use dotenvy::dotenv;

mod conn;
mod schema;

#[tokio::main]
async fn main() -> redis::RedisResult<()> {
    // Load Env
    dotenv().ok();

    let mut conn = conn::get_redis_connection().await?;
    let mut pubsub = conn.as_pubsub();
    let subs_channel = "runner_channel";

    pubsub.subscribe(subs_channel)?;
    println!("Listening for commands on '{}'...", subs_channel);

    loop {
        let msg = pubsub.get_message()?;
        let payload: String = msg.get_payload()?;
        println!("Received message: {:?}", msg);

        let event_data: schema::EventData = serde_json::from_str(&payload)
            .map_err(|e| redis::RedisError::from((redis::ErrorKind::TypeError, "JSON deserialization error", e.to_string())))?;

        // TODO: Execute Jar File
    }

    Ok(())
}
