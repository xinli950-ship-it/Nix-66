# Kling AI Global API Integration Plan

## Authentication
Kling AI uses JWT (JSON Web Token) for authentication.
- **Algorithm:** HS256
- **Header:**
  ```json
  {
    "alg": "HS256",
    "typ": "JWT"
  }
  ```
- **Payload:**
  ```json
  {
    "iss": "YOUR_ACCESS_KEY",
    "exp": CURRENT_TIMESTAMP + TTL,
    "nbf": CURRENT_TIMESTAMP - 5
  }
  ```
- **Secret:** `YOUR_SECRET_KEY`
- **Authorization Header:** `Bearer <TOKEN>`

## Base URL
- **Global:** `https://api.klingai.com`

## Endpoints

### 1. Text to Video
- **URL:** `POST /v1/videos/text2video`
- **Body:**
  ```json
  {
    "model_name": "kling-v1", 
    "prompt": "Fighter 1 vs Fighter 2 epic battle...",
    "negative_prompt": "low quality, blurry...",
    "cfg_scale": 0.5,
    "mode": "std",
    "aspect_ratio": "16:9",
    "duration": "5"
  }
  ```

### 2. Image to Video (Character Battle)
- **URL:** `POST /v1/videos/image2video`
- **Body:**
  ```json
  {
    "model_name": "kling-v1",
    "image": "URL_TO_FIGHTER_1_IMAGE",
    "image_tail": "URL_TO_FIGHTER_2_IMAGE",
    "prompt": "Epic fight between these two",
    "duration": "5"
  }
  ```

### 3. Query Task Status
- **URL:** `GET /v1/videos/text2video/{taskId}` or `GET /v1/videos/image2video/{taskId}`
- **Response Statuses:** `submitted`, `processing`, `succeed`, `failed`

## Implementation Strategy
- Use Next.js Route Handlers to keep API keys secure on the server.
- Implement a polling mechanism in the frontend or use a webhook if supported (polling is confirmed by existing implementations).
- Store `taskId` in a database (Turso/SQLite) to track match progress.
