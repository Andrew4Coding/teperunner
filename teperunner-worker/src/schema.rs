use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EventData {
    pub id: String,
    pub jar_path: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub id: String,
    pub status: String,
    pub content: String,
    pub is_error: bool,
}