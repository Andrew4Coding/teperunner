use dotenvy::dotenv;
use redis::Commands;
use uuid::Uuid;

mod conn;
mod schema;

#[tokio::main]
async fn main() -> redis::RedisResult<()> {
    // Load Env
    dotenv().ok();

    let mut sub_conn = conn::get_redis_connection().await?;
    let mut pubsub = sub_conn.as_pubsub();

    let subs_channel = "runner_channel";
    let response_channel = "response_channel";

    pubsub.subscribe(subs_channel)?;
    println!("Listening for commands on '{}'...", subs_channel);

    loop {
        let msg = pubsub.get_message()?;
        let payload: String = msg.get_payload()?;
        println!("Received message: {:?}", msg);

        let event_data: schema::EventData = serde_json::from_str(&payload).map_err(|e| {
            redis::RedisError::from((
                redis::ErrorKind::TypeError,
                "JSON deserialization error",
                e.to_string(),
            ))
        })?;

        // TODO: Execute Jar File

        let event_response = schema::EventResponse {
            content: format!("Executed command: {}", event_data.jar_path),
            id: Uuid::new_v4().to_string(),
            status: "success".to_string(),
            is_error: false,
        };

        let message = serde_json::to_string(&event_response).map_err(|e| {
            redis::RedisError::from((
                redis::ErrorKind::TypeError,
                "JSON serialization error",
                e.to_string(),
            ))
        })?;

        println!("Publishing response: {}", message);

        // Use a separate connection for publishing
        let mut pub_conn = conn::get_redis_connection().await?;
        pub_conn.publish::<_, _, ()>(response_channel, message)?;
    }
}
